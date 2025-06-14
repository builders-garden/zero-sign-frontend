"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
// Using simple alerts instead of toast for now

interface PrecomputedSafe {
  safeId: string;
  zkOwnerAddress: string;
  threshold: number;
}

export default function CreateMultisigPage() {
  const { address, isConnected } = useAccount();
  const [threshold, setThreshold] = useState(1);
  const [description, setDescription] = useState("");
  const [isPrecomputing, setIsPrecomputing] = useState(false);
  const [precomputedSafe, setPrecomputedSafe] =
    useState<PrecomputedSafe | null>(null);

  const handlePrecomputeAddress = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (threshold < 1) {
      alert("Threshold must be at least 1");
      return;
    }

    setIsPrecomputing(true);

    try {
      const response = await fetch("/api/safe-precompute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signerAddress: address,
          threshold,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to precompute address");
      }

      const data = await response.json();
      setPrecomputedSafe(data);
      alert("Address precomputed successfully!");
    } catch (error) {
      console.error("Error precomputing address:", error);
      alert(
        error instanceof Error ? error.message : "Failed to precompute address"
      );
    } finally {
      setIsPrecomputing(false);
    }
  };

  const copyShareableLink = () => {
    if (!precomputedSafe) return;

    const shareableUrl = `${window.location.origin}/app/create/${precomputedSafe.safeId}`;
    navigator.clipboard.writeText(shareableUrl);
    alert("Shareable link copied to clipboard!");
  };

  const resetForm = () => {
    setPrecomputedSafe(null);
    setThreshold(1);
    setDescription("");
  };

  return (
    <div className="max-w-xl mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4">Create a New ZK Safe Multisig</h2>
      <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 flex flex-col gap-6">
        {!precomputedSafe ? (
          <>
            <div className="bg-neutral-900 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 text-blue-400">How it works</h3>
              <div className="text-sm text-neutral-300 space-y-2">
                <p>
                  1. Set your desired threshold (number of signatures required)
                </p>
                <p>
                  2. Click "Precompute Address" to generate your ZK Safe's
                  unique address
                </p>
                <p>
                  3. Share the generated link with signers to collect their
                  signatures
                </p>
                <p>
                  4. Once enough signatures are collected, deploy your Safe
                  contract
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Threshold</h3>
              <input
                type="number"
                min={1}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500 w-32"
              />
              <span className="ml-2 text-sm text-neutral-400">
                signatures required
              </span>
            </div>
            <Button
              onClick={handlePrecomputeAddress}
              disabled={isPrecomputing || !isConnected}
              className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-3 text-lg shadow-lg border-l-4 border-transparent hover:border-green-400 transition-all mt-4"
            >
              {isPrecomputing ? "Precomputing..." : "Precompute Address"}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-neutral-900 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-green-400">
                Safe Precomputed Successfully!
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-neutral-400">ZK Owner Address:</span>
                  <div className="font-mono bg-neutral-800 p-2 rounded mt-1 break-all">
                    {precomputedSafe.zkOwnerAddress}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400">Threshold:</span>
                  <span className="ml-2 font-semibold">
                    {precomputedSafe.threshold}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={copyShareableLink}
                className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl px-6 py-3"
              >
                Copy Shareable Link
              </Button>
              <Button
                onClick={() =>
                  window.open(`/app/create/${precomputedSafe.safeId}`, "_blank")
                }
                className="flex-1 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl px-6 py-3"
              >
                Open Signing Page
              </Button>
            </div>

            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full border-neutral-600 text-neutral-400 hover:bg-neutral-700"
            >
              Create Another Safe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
