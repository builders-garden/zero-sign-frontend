"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateProposalPage() {
  const [to, setTo] = useState("");
  const [calldata, setCalldata] = useState("");
  const [value, setValue] = useState("");
  const [zkSafeAddress, setZkSafeAddress] = useState("");

  const handleCreate = () => {
    // Placeholder for create logic
    alert(
      `Proposal created!\nTo: ${to}\nCalldata: ${calldata}\nValue: ${value}`
    );
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
        <Button
          className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-3 text-lg shadow-lg border-l-4 border-transparent hover:border-green-400 transition-all mt-4"
          onClick={handleCreate}
          disabled={!to || !calldata || !value}
        >
          Create Proposal
        </Button>
      </div>
    </div>
  );
}
