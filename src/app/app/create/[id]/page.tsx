"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { useParams } from "next/navigation";

interface SafeData {
  safeId: string;
  zkOwnerAddress: string;
  threshold: number;
  signatures: Array<{
    id: string;
    signerAddress: string;
    signature: string;
    createdAt: string;
  }>;
  signatureCount: number;
  isReady: boolean;
  deployed: boolean;
  address?: string;
}

export default function SafeSigningPage() {
  const params = useParams();
  const safeId = params.id as string;
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();

  const [safeData, setSafeData] = useState<SafeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const fetchSafeData = async () => {
    try {
      const response = await fetch(`/api/safe-sign?safeId=${safeId}`);
      if (response.ok) {
        const data = await response.json();
        setSafeData(data);
      } else {
        console.error("Failed to fetch safe data");
      }
    } catch (error) {
      console.error("Error fetching safe data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (safeId) {
      fetchSafeData();
    }
  }, [safeId]);

  const handleSign = async () => {
    if (!address || !safeData || !isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    // Check if already signed
    const alreadySigned = safeData.signatures.some(
      (sig) => sig.signerAddress.toLowerCase() === address.toLowerCase()
    );
    if (alreadySigned) {
      alert("You have already signed this Safe");
      return;
    }

    setSigning(true);

    try {
      const messageWithoutPrefix = safeData.zkOwnerAddress.replace("0x", "");
      const message = `${messageWithoutPrefix}`;
      
      signMessage(
        { account: address, message },
        {
          onSuccess: async (signature) => {
            try {
              const response = await fetch("/api/safe-sign", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  safeId: safeData.safeId,
                  signerAddress: address,
                  signature,
                }),
              });

              if (response.ok) {
                alert("Signature added successfully!");
                fetchSafeData(); // Refresh data
              } else {
                const error = await response.json();
                alert(error.error || "Failed to add signature");
              }
            } catch (error) {
              console.error("Error adding signature:", error);
              alert("Failed to add signature");
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
  };

  const handleDeploy = async () => {
    if (!safeData) return;

    setDeploying(true);
    console.log("safeData", safeData);

    try {
      const response = await fetch("/api/safe-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          safeId: safeData.safeId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Safe deployed successfully! Address: ${result.safeAddress}`);
        fetchSafeData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || "Failed to deploy Safe");
      }
    } catch (error) {
      console.error("Error deploying safe:", error);
      alert("Failed to deploy Safe");
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-16">
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading Safe data...</p>
        </div>
      </div>
    );
  }

  if (!safeData) {
    return (
      <div className="max-w-xl mx-auto mt-16">
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-400">
            Safe Not Found
          </h2>
          <p>
            The Safe you're looking for doesn't exist or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  const alreadySigned =
    address &&
    safeData.signatures.some(
      (sig) => sig.signerAddress.toLowerCase() === address.toLowerCase()
    );

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4">ZK Safe Signature Collection</h2>

      <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 space-y-6">
        {/* Safe Info */}
        <div className="bg-neutral-900 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-green-400">
            Safe Information
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-neutral-400">ZK Owner Address:</span>
              <div className="font-mono bg-neutral-800 p-2 rounded mt-1 break-all">
                {safeData.zkOwnerAddress}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Threshold:</span>
              <span className="font-semibold">{safeData.threshold}</span>
            </div>
            {safeData.deployed && (
              <div>
                <span className="text-neutral-400">Deployed Address:</span>
                <div className="font-mono bg-neutral-800 p-2 rounded mt-1 break-all text-green-400">
                  {safeData.address}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signature Status */}
        <div className="bg-neutral-900 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-blue-400">
            Signature Status ({safeData.signatureCount}/{safeData.threshold})
          </h3>

          <div className="mb-4">
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (safeData.signatureCount / safeData.threshold) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {safeData.signatures.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-400">
                Signatures:
              </h4>
              {safeData.signatures.map((sig, idx) => (
                <div
                  key={sig.id}
                  className="flex items-center justify-between bg-neutral-800 p-2 rounded"
                >
                  <span className="font-mono text-sm">{sig.signerAddress}</span>
                  <span className="text-xs text-green-400">✓ Signed</span>
                </div>
              ))}
            </div>
          )}

          {safeData.isReady && !safeData.deployed && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                ✅ Ready to deploy! All required signatures collected.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!safeData.deployed && (
            <>
              {isConnected && !alreadySigned && (
                <Button
                  onClick={handleSign}
                  disabled={signing}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl px-6 py-3"
                >
                  {signing ? "Signing..." : "Sign Safe Creation"}
                </Button>
              )}

              {safeData.isReady && (
                <Button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-6 py-3"
                >
                  {deploying ? "Deploying..." : "Deploy Safe"}
                </Button>
              )}
            </>
          )}

          {!isConnected && (
            <div className="text-center text-neutral-400">
              Please connect your wallet to participate
            </div>
          )}

          {alreadySigned && (
            <div className="text-center text-green-400">
              ✅ You have already signed this Safe
            </div>
          )}

          {safeData.deployed && (
            <div className="text-center text-green-400 text-lg font-semibold">
              🎉 Safe has been successfully deployed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
