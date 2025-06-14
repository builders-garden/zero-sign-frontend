"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateMultisigPage() {
  const [signers, setSigners] = useState([""]);
  const [threshold, setThreshold] = useState(1);

  const handleSignerChange = (idx: number, value: string) => {
    setSigners(signers.map((s, i) => (i === idx ? value : s)));
  };
  const addSigner = () => setSigners([...signers, ""]);
  const removeSigner = (idx: number) =>
    setSigners(
      signers.length > 1 ? signers.filter((_, i) => i !== idx) : signers
    );

  return (
    <div className="max-w-xl mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4">Create a New ZK Safe Multisig</h2>
      <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 flex flex-col gap-6">
        <div>
          <h3 className="font-semibold mb-2">Signers</h3>
          {signers.map((signer, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={`Signer address #${idx + 1}`}
                value={signer}
                onChange={(e) => handleSignerChange(idx, e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button
                type="button"
                variant="outline"
                className="border-red-500 text-red-400 px-2 py-1"
                onClick={() => removeSigner(idx)}
                disabled={signers.length === 1}
              >
                -
              </Button>
              {idx === signers.length - 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-green-500 text-green-400 px-2 py-1"
                  onClick={addSigner}
                >
                  +
                </Button>
              )}
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Threshold</h3>
          <input
            type="number"
            min={1}
            max={signers.length}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500 w-32"
          />
          <span className="ml-2 text-sm text-neutral-400">
            of {signers.length} signers
          </span>
        </div>
        <Button className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-3 text-lg shadow-lg border-l-4 border-transparent hover:border-green-400 transition-all mt-4">
          Create ZK Safe
        </Button>
      </div>
    </div>
  );
}
