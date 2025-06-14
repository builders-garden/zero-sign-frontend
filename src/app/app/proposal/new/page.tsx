"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CreateProposalPage() {
  const [to, setTo] = useState("");
  const [calldata, setCalldata] = useState("");
  const [value, setValue] = useState("");
  const [zkSafeAddress, setZkSafeAddress] = useState("");
  const [nonce, setNonce] = useState<number | null>(null);
  const [threshold, setThreshold] = useState<number | null>(null);
  const [zkOwnerAddress, setZkOwnerAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter Safe Address, 2: Fill Proposal Details
  const [fetchError, setFetchError] = useState("");
  const router = useRouter();

  const fetchSafeInfo = async () => {
    if (!zkSafeAddress.trim()) {
      setFetchError("Please enter a Safe address");
      return;
    }

    setIsFetchingInfo(true);
    setFetchError("");

    try {
      // Create a test API call to fetch the Safe info
      const response = await fetch("/api/safe-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          safeAddress: zkSafeAddress,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNonce(data.nonce);
        setThreshold(data.threshold);
        setZkOwnerAddress(data.zkOwnerAddress);
        setStep(2);
      } else {
        setFetchError(data.error || "Failed to fetch Safe information");
      }
    } catch (error) {
      console.error("Error fetching Safe info:", error);
      setFetchError("Failed to connect to blockchain. Please try again.");
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleCreate = async () => {
    if (!to || !calldata || !value || !zkSafeAddress) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          calldata,
          value,
          safeAddress: zkSafeAddress,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Proposal created successfully! ID: ${data.proposal.id}`);
        router.push("/app/proposals");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setZkSafeAddress("");
    setNonce(null);
    setThreshold(null);
    setZkOwnerAddress("");
    setTo("");
    setCalldata("");
    setValue("");
    setFetchError("");
  };

  return (
    <div className="max-w-xl mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4">Create Proposal</h2>

      {step === 1 ? (
        // Step 1: Enter Safe Address
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 1: Enter Safe Address
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              Enter your ZK Safe address to fetch the current nonce and
              threshold from the blockchain.
            </p>
          </div>

          <input
            type="text"
            placeholder="ZK Safe Address (0x...)"
            value={zkSafeAddress}
            onChange={(e) => setZkSafeAddress(e.target.value)}
            className="rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyPress={(e) => e.key === "Enter" && fetchSafeInfo()}
          />

          {fetchError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {fetchError}
            </div>
          )}

          <Button
            className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-3 text-lg shadow-lg border-l-4 border-transparent hover:border-green-400 transition-all"
            onClick={fetchSafeInfo}
            disabled={!zkSafeAddress.trim() || isFetchingInfo}
          >
            {isFetchingInfo ? "Fetching Info..." : "Fetch Safe Info"}
          </Button>
        </div>
      ) : (
        // Step 2: Show Safe Info and Fill Proposal Details
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Step 2: Proposal Details
            </h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-neutral-400">Safe Address:</span>
              <button
                onClick={resetForm}
                className="text-green-400 hover:text-green-300 text-sm underline"
              >
                Change Safe
              </button>
            </div>
          </div>

          {/* Safe Information Display */}
          <div className="bg-neutral-900 rounded-lg p-4 space-y-3">
            <div className="text-sm">
              <span className="text-neutral-400">Safe Address:</span>
              <div className="font-mono text-white break-all">
                {zkSafeAddress}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-400">Current Nonce:</span>
                <div className="font-mono text-white">{nonce}</div>
              </div>
              <div>
                <span className="text-neutral-400">Threshold:</span>
                <div className="font-mono text-white">{threshold}</div>
              </div>
            </div>
            {zkOwnerAddress && (
              <div className="text-sm">
                <span className="text-neutral-400">ZK Owner:</span>
                <div className="font-mono text-white break-all">
                  {zkOwnerAddress}
                </div>
              </div>
            )}
          </div>

          {/* Proposal Parameters */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="To (recipient address)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Calldata (0x...)"
              value={calldata}
              onChange={(e) => setCalldata(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Value (ETH)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-neutral-600 text-black bg-gray-200 hover:bg-gray-300"
              onClick={resetForm}
            >
              Back
            </Button>
            <Button
              className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-3 text-lg shadow-lg border-l-4 border-transparent hover:border-green-400 transition-all"
              onClick={handleCreate}
              disabled={!to || !calldata || !value || isLoading}
            >
              {isLoading ? "Creating..." : "Create Proposal"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
