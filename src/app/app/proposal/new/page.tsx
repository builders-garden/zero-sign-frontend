"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CreateProposalPage() {
  const [to, setTo] = useState("");
  const [calldata, setCalldata] = useState("");
  const [value, setValue] = useState("");
  const [zkSafeAddress, setZkSafeAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        // Redirect to proposals list
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

  return (
    <div className="max-w-xl mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4">Create Proposal</h2>
      <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 flex flex-col gap-6">
        <input
          type="text"
          placeholder="ZK Safe Address"
          value={zkSafeAddress}
          onChange={(e) => setZkSafeAddress(e.target.value)}
          className="rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="To (address)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="Calldata"
          value={calldata}
          onChange={(e) => setCalldata(e.target.value)}
          className="rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="number"
          placeholder="Value (ETH)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="text-sm text-neutral-400 bg-neutral-900 rounded-lg p-3">
          <strong>Note:</strong> Nonce and threshold will be automatically
          fetched from the blockchain contracts.
        </div>
        <Button
          className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-3 text-lg shadow-lg border-l-4 border-transparent hover:border-green-400 transition-all mt-4"
          onClick={handleCreate}
          disabled={!to || !calldata || !value || !zkSafeAddress || isLoading}
        >
          {isLoading ? "Creating..." : "Create Proposal"}
        </Button>
      </div>
    </div>
  );
}
