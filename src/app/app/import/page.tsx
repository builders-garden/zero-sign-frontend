"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConnectedSafe } from "../../AppLayoutClient";

export default function ImportMultisigPage() {
  const [address, setAddress] = useState("");
  const { setConnectedSafe } = useConnectedSafe();

  const handleLoad = () => {
    setConnectedSafe(address);
    alert(`Loading Safe at address: ${address}`);
  };

  return (
    <div className="max-w-xl mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4">Import Existing ZK Safe</h2>
      <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 flex flex-col gap-6">
        <input
          type="text"
          placeholder="ZK Safe address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Button
          className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-3 text-lg shadow-lg border-l-4 border-transparent hover:border-green-400 transition-all"
          onClick={handleLoad}
          disabled={!address}
        >
          Load Safe
        </Button>
      </div>
    </div>
  );
}
