"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { useParams } from "next/navigation";
import { encodeAbiParameters, keccak256, recoverPublicKey } from "viem";
import Link from "next/link";
import { Barretenberg, RawBuffer, UltraHonkBackend } from "@aztec/bb.js";
import { CompiledCircuit, Noir } from "@noir-lang/noir_js";
import ecdsa_multisig from "../../../../../public/proof/ecdsa_multisig.json";

interface Proof {
  id: number;
  value: string;
  proposalId: number;
}

interface NoirCircuit {
  bytecode: string;
  abi: any;
  noir_version: string;
  hash: number;
}

interface Proposal {
  id: number;
  calldata: string;
  to: string;
  value: string;
  nonce: number;
  threshold: number;
  zkOwnerAddress: string;
  safeAddress: string;
  proofs: Proof[];
}

function proofToFields(bytes: Uint8Array | string): string[] {
  const byteArray =
    typeof bytes === "string" ? new Uint8Array(Buffer.from(bytes)) : bytes;
  const fields = [];
  for (let i = 0; i < byteArray.length; i += 32) {
    const fieldBytes = new Uint8Array(32);
    const end = Math.min(i + 32, byteArray.length);
    for (let j = 0; j < end - i; j++) {
      fieldBytes[j] = byteArray[i + j];
    }
    fields.push(Buffer.from(fieldBytes));
  }
  return fields.map((field) => "0x" + field.toString("hex"));
}

export default function ProposalDetailsPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();

  const [operationSignature, setOperationSignature] = useState<
    `0x${string}` | null
  >(null);
  const [operationSignaturePubX, setOperationSignaturePubX] = useState<
    string | null
  >(null);
  const [operationSignaturePubY, setOperationSignaturePubY] = useState<
    string | null
  >(null);
  const [identitySignature, setIdentitySignature] = useState<
    `0x${string}` | null
  >(null);
  const [identitySignaturePubX, setIdentitySignaturePubX] = useState<
    string | null
  >(null);
  const [identitySignaturePubY, setIdentitySignaturePubY] = useState<
    string | null
  >(null);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proposals/${proposalId}`);
      const data = await response.json();

      if (data.success) {
        setProposal(data.proposal);
      } else {
        setError(data.error || "Failed to fetch proposal");
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
      setError("Failed to fetch proposal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  const handleSign = async () => {
    if (!address || !proposal || !isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    // Check if already signed
    const alreadySigned = proposal.proofs.some(
      (proof) => proof.value.includes(address) // This is a simple check, you might want to improve this
    );

    if (alreadySigned) {
      alert("You may have already signed this proposal");
    }

    setSigning(true);

    try {
      // Step 1: Sign the operation message
      const messageToSign = encodeAbiParameters(
        [{ type: "address" }, { type: "uint256" }, { type: "bytes" }],
        [
          proposal.to as `0x${string}`,
          BigInt(proposal.value),
          proposal.calldata as `0x${string}`,
        ]
      );

      console.log("Requesting first signature (operation)...");
      const operationSig = await new Promise<`0x${string}`>(
        (resolve, reject) => {
          signMessage(
            { account: address, message: messageToSign },
            {
              onSuccess: (signature) => resolve(signature),
              onError: (error) => reject(error),
            }
          );
        }
      );

      setOperationSignature(operationSig);
      const operationPublicKey = await recoverPublicKey({
        hash: keccak256(messageToSign),
        signature: operationSig,
      });
      const opPubX = operationPublicKey.slice(4, 68);
      const opPubY = operationPublicKey.slice(68);
      setOperationSignaturePubX(opPubX);
      setOperationSignaturePubY(opPubY);

      console.log("First signature completed");

      // Step 2: Sign the identity verification message
      const messageToSignZkAddress = proposal.zkOwnerAddress;
      const messageToSignZkAddressWithoutPrefix =
        messageToSignZkAddress.replace("0x", "");

      console.log("Requesting second signature (identity)...");
      const identitySig = await new Promise<`0x${string}`>(
        (resolve, reject) => {
          signMessage(
            { account: address, message: messageToSignZkAddressWithoutPrefix },
            {
              onSuccess: (signature) => resolve(signature),
              onError: (error) => reject(error),
            }
          );
        }
      );

      setIdentitySignature(identitySig);
      const signatureZkAddressHash = keccak256(identitySig);
      const identityPublicKey = await recoverPublicKey({
        hash: signatureZkAddressHash,
        signature: identitySig,
      });
      const identityPubX = identityPublicKey.slice(4, 68);
      const identityPubY = identityPublicKey.slice(68);
      setIdentitySignaturePubX(identityPubX);
      setIdentitySignaturePubY(identityPubY);

      console.log("Second signature completed");

      // Step 3: Save proof/signature to database
      try {
        const response = await fetch("/api/proof-save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proposalId: proposal.id,
            safeAddress: proposal.safeAddress,
            zkOwnerAddress: proposal.zkOwnerAddress,
            proof: operationSig, // Using the operation signature as the proof
          }),
        });

        if (response.ok) {
          console.log("Proof/signature saved successfully");
          fetchProposal(); // Refresh proposal data
        } else {
          const error = await response.json();
          console.error("Failed to save proof:", error);
        }
      } catch (error) {
        console.error("Error saving proof:", error);
      }

      // Step 4: Generate ZK proof
      await generateZKProof(
        proposal,
        operationSig,
        identitySig,
        opPubX,
        opPubY,
        identityPubX,
        identityPubY
      );
    } catch (error) {
      console.error("Error in signing process:", error);
      alert("Failed to complete signing process");
    } finally {
      setSigning(false);
    }
  };

  const generateZKProof = async (
    proposal: Proposal,
    operationSignature: `0x${string}`,
    identitySignature: `0x${string}`,
    operationPubX: string,
    operationPubY: string,
    identityPubX: string,
    identityPubY: string
  ) => {
    const threshold = proposal.threshold;
    console.log("threshold", threshold);

    // Fetch safe signatures from API
    let signaturesHashesArray: string[] = [];
    try {
      console.log("proposal.safeAddress", proposal.safeAddress);
      const signaturesResponse = await fetch(
        `/api/safe-signatures/${proposal.safeAddress}`
      );
      console.log("signaturesResponse.status", signaturesResponse.status);

      if (signaturesResponse.ok) {
        const signaturesData = await signaturesResponse.json();
        console.log("signaturesData", signaturesData);
        signaturesHashesArray = signaturesData.signatureHashes || [];
        console.log("signaturesHashesArray", signaturesHashesArray);
      } else {
        const errorData = await signaturesResponse.json();
        console.error("API Error:", errorData);
        alert(
          `Failed to fetch safe signatures: ${
            errorData.error || "Unknown error"
          }`
        );
        return;
      }
    } catch (error) {
      console.error("Error fetching safe signatures:", error);
      alert("Error fetching safe signatures for proof generation");
      return;
    }
    console.log("porcodio");
    const noir = new Noir(ecdsa_multisig as NoirCircuit);
    //@ts-ignore
    const backend = new UltraHonkBackend(
      (ecdsa_multisig as CompiledCircuit).bytecode,
      { threads: 4 },
      { recursive: true }
    );
    const messageToSign = encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }, { type: "bytes" }],
      [
        proposal.to as `0x${string}`,
        BigInt(proposal.value),
        proposal.calldata as `0x${string}`,
      ]
    );

    const inputs = {
      message_hash: keccak256(messageToSign),
      operation_signature: operationSignature,
      identity_verification_signature: identitySignature,
      identity_pub_x: operationPubX,
      identity_pub_y: operationPubY,
      operation_pub_x: identityPubX,
      operation_pub_y: identityPubY,
      signers_identifiers: signaturesHashesArray,
      threshold,
      contract_address: proposal.zkOwnerAddress,
    };

    console.log("Final circuit inputs:", inputs);
    console.log("Generating witness...");
    //@ts-ignore
    const { witness } = await noir.execute(inputs);
    console.log("Witness generated:", witness);

    console.log("Generating proof...");
    //@ts-ignore
    const rawProof = await backend.generateProof(witness);
    console.log("Generated proof:", rawProof);
    // Verify the proof
    const isVerified = await backend.verifyProof(rawProof);
    console.log("proof verification result:", isVerified);
    if (isVerified) {
      const proofBytes = `0x${Buffer.from(rawProof.proof).toString("hex")}`;
      const publicInputsArray = rawProof.publicInputs.slice(0, 8);
      // Generate recursive proof artifacts
      const { proof: innerProofFields, publicInputs: innerPublicInputs } =
        await backend.generateProofForRecursiveAggregation(witness);

      const publicInputElements = 8;
      const proofAsFields = [
        ...rawProof.publicInputs.slice(publicInputElements),
        ...proofToFields(rawProof.proof),
      ];
      console.log("proof field length", proofAsFields.length);

      console.log("proofAsFields generated");

      const innerCircuitVerificationKey = await backend.getVerificationKey();
      if (!innerCircuitVerificationKey) {
        throw new Error("Verification key could not be retrieved");
      }

      const barretenbergAPI = await Barretenberg.new({ threads: 1 });
      const vkAsFields = (
        await barretenbergAPI.acirVkAsFieldsUltraHonk(
          new RawBuffer(innerCircuitVerificationKey)
        )
      ).map((field) => field.toString());

      if (!vkAsFields) {
        throw new Error("vkAsFields is undefined");
      }

      const proofData = {
        rawProof,
        vkAsFields,
        proofAsFields: innerProofFields,
        inputsAsFields: innerPublicInputs,
      };
    } else {
      alert("Proof verification failed!");
    }
  };

  const getProofStatus = () => {
    if (!proposal) return { committed: 0, missing: 0, isComplete: false };

    const committed = proposal.proofs.length;
    const missing = Math.max(0, proposal.threshold - committed);
    const isComplete = committed >= proposal.threshold;

    return { committed, missing, isComplete };
  };

  const copyShareableLink = () => {
    const shareableUrl = `${window.location.origin}/app/proposal/${proposalId}`;
    navigator.clipboard.writeText(shareableUrl);
    alert("Shareable link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-16">
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-16">
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-400">Error</h2>
          <p>{error}</p>
          <Link
            href="/app/proposals"
            className="text-green-400 hover:text-green-300 underline mt-4 inline-block"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="max-w-2xl mx-auto mt-16">
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-400">
            Proposal Not Found
          </h2>
          <p>The proposal you're looking for doesn't exist.</p>
          <Link
            href="/app/proposals"
            className="text-green-400 hover:text-green-300 underline mt-4 inline-block"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  const { committed, missing, isComplete } = getProofStatus();

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/app/proposals"
          className="text-green-400 hover:text-green-300"
        >
          ← Back to Proposals
        </Link>
        <h2 className="text-2xl font-bold">Proposal #{proposal.id}</h2>
      </div>

      <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 space-y-6">
        {/* Status Banner */}
        <div
          className={`p-4 rounded-lg ${
            isComplete
              ? "bg-green-900/20 border border-green-500/20"
              : "bg-yellow-900/20 border border-yellow-500/20"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <div
                className={`text-lg font-semibold ${
                  isComplete ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {isComplete ? "✅ Ready to Execute" : "⏳ Pending Signatures"}
              </div>
              <div className="text-sm text-neutral-400">
                {committed}/{proposal.threshold} signatures collected
                {!isComplete && ` (${missing} more needed)`}
              </div>
            </div>
            <div className="text-right">
              <div className="w-full bg-neutral-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isComplete ? "bg-green-500" : "bg-yellow-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (committed / proposal.threshold) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Proposal Details */}
        <div className="bg-neutral-900 rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-green-400">
            Proposal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-400">Safe Address:</span>
              <div className="font-mono bg-neutral-800 p-2 rounded mt-1 break-all">
                {proposal.safeAddress}
              </div>
            </div>
            <div>
              <span className="text-neutral-400">ZK Owner:</span>
              <div className="font-mono bg-neutral-800 p-2 rounded mt-1 break-all">
                {proposal.zkOwnerAddress}
              </div>
            </div>
            <div>
              <span className="text-neutral-400">To Address:</span>
              <div className="font-mono bg-neutral-800 p-2 rounded mt-1 break-all">
                {proposal.to}
              </div>
            </div>
            <div>
              <span className="text-neutral-400">Value:</span>
              <div className="bg-neutral-800 p-2 rounded mt-1">
                {proposal.value} ETH
              </div>
            </div>
            <div>
              <span className="text-neutral-400">Nonce:</span>
              <div className="bg-neutral-800 p-2 rounded mt-1">
                {proposal.nonce}
              </div>
            </div>
            <div>
              <span className="text-neutral-400">Threshold:</span>
              <div className="bg-neutral-800 p-2 rounded mt-1">
                {proposal.threshold} signatures
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-neutral-400">Calldata:</span>
            <div className="font-mono bg-neutral-800 p-2 rounded mt-1 break-all text-xs">
              {proposal.calldata}
            </div>
          </div>
        </div>

        {/* Signatures/Proofs */}
        <div className="bg-neutral-900 rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-blue-400">
            Signatures ({proposal.proofs.length})
          </h3>
          {proposal.proofs.length === 0 ? (
            <div className="text-neutral-400 text-center py-4">
              No signatures submitted yet
            </div>
          ) : (
            <div className="space-y-3">
              {proposal.proofs.map((proof, index) => (
                <div key={proof.id} className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-neutral-400">
                      Signature #{index + 1}
                    </span>
                    <span className="text-xs text-neutral-500">
                      ID: {proof.id}
                    </span>
                  </div>
                  <div className="text-white font-mono text-xs break-all">
                    {proof.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSign}
            disabled={signing || !isConnected}
            className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl px-6 py-3"
          >
            {signing ? "Signing..." : "Sign Proposal"}
          </Button>
          <Button
            onClick={copyShareableLink}
            className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-6 py-3"
          >
            Share Link
          </Button>
        </div>

        {!isConnected && (
          <div className="text-center text-neutral-400">
            Please connect your wallet to sign this proposal
          </div>
        )}
      </div>
    </div>
  );
}
