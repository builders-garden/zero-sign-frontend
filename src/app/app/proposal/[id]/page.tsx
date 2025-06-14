"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { useParams } from "next/navigation";
import { encodeAbiParameters, keccak256, recoverPublicKey } from 'viem'
import Link from "next/link";
import { prisma } from "@/lib/client";

interface Proof {
  id: number;
  value: string;
  proposalId: number;
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

export default function ProposalDetailsPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();

  const [operationSignature, setOperationSignature] = useState<`0x${string}` | null>(null);
  const [operationSignaturePubX, setOperationSignaturePubX] = useState<string | null>(null);
  const [operationSignaturePubY, setOperationSignaturePubY] = useState<string | null>(null);
  const [identitySignature, setIdentitySignature] = useState<`0x${string}` | null>(null);
  const [identitySignaturePubX, setIdentitySignaturePubX] = useState<string | null>(null);
  const [identitySignaturePubY, setIdentitySignaturePubY] = useState<string | null>(null);

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
      //sign encode of to, value and data
      const messageToSign = encodeAbiParameters([{ type: "address" }, { type: "uint256" }, { type: "bytes" }], [proposal.to as `0x${string}`, BigInt(proposal.value), proposal.calldata as `0x${string}`]);

      signMessage(
        { account: address, message: messageToSign },
        {
          onSuccess: async (signature) => {
            setOperationSignature(signature);
            const publicKey = await recoverPublicKey({hash: keccak256(messageToSign), signature: signature});
            console.log("publicKey", publicKey);
            setOperationSignaturePubX(publicKey.slice(4, 68));
            setOperationSignaturePubY(publicKey.slice(68));
            console.log("operationSignaturePubX", operationSignaturePubX);
            console.log("operationSignaturePubY", operationSignaturePubY);

            try {
              const response = await fetch("/api/proof-save", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  proposalId: proposal.id,
                  signature,
                  signerAddress: address,
                }),
              });

              if (response.ok) {
                alert("Proof/signature added successfully!");
                fetchProposal(); // Refresh proposal data
              } else {
                const error = await response.json();
                alert(error.error || "Failed to add proof");
              }
            } catch (error) {
              console.error("Error adding proof:", error);
              alert("Failed to add proof");
            }
          },
          onError: (error) => {
            console.error("Error signing message:", error);
            alert("Failed to sign message");
          },
        }
      );
    } finally {
      setSigning(false);
    }

    //sign another message
    const messageToSignZkAddress = proposal.zkOwnerAddress;
    //remove prefix 0x from the message
    const messageToSignZkAddressWithoutPrefix = messageToSignZkAddress.replace("0x", "");
    const signatureZkAddress = signMessage({ account: address, message: messageToSignZkAddressWithoutPrefix }, {
      onSuccess: async (signature) => {
        console.log("signature", signature);
        const signatureZkAddressHash = keccak256(signature as `0x${string}`);
        console.log("signatureZkAddressHash", signatureZkAddressHash);
        //remove prefix 0x from the signature
        setIdentitySignature(signature);
        const publicKey = await recoverPublicKey({hash: (signatureZkAddressHash), signature: signature});
        console.log("publicKey", publicKey);
        setIdentitySignaturePubX(publicKey.slice(4, 68));
        setIdentitySignaturePubY(publicKey.slice(68));
        console.log("identitySignaturePubX", identitySignaturePubX);
        console.log("identitySignaturePubY", identitySignaturePubY);
      },
      onError: (error) => {
        console.error("Error signing message:", error);
        alert("Failed to sign message");
      },
    });

    const threshold = proposal.threshold;
    //get safe from the proposal
    const safe = await prisma.safe.findUnique({
      where: {
        id: proposal.safeAddress,
      },
    });
    const safeId = safe?.id;
    
    //get safe signatures hashes from the safe
    const signaturesHashes = await prisma.safeSignature.findMany({
      where: {
        safeId: safeId,
      },
    });
    //get the signatures hashes from the signaturesHashes array
    const signaturesHashesArray = signaturesHashes.map((signature) => signature.signatureHash);
    
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
