import * as React from "react";
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";

export function WalletOptions() {
  const { connectors, connect, status } = useConnect();
  const connector =
    connectors.find((c) => c.id === "injected" || c.name === "MetaMask") ||
    connectors[0];

  if (!connector) {
    return <div className="text-red-500">No wallet connector found.</div>;
  }

  return (
    <div className="flex flex-col items-end">
      <Button
        onClick={() => connect({ connector })}
        className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-4 py-2 text-sm shadow border-l-4 border-transparent hover:border-green-400 transition-all"
        disabled={status === "pending"}
      >
        {status === "pending" ? "Connecting..." : "Connect Wallet"}
      </Button>
      {!connector.ready && (
        <span className="text-xs text-yellow-400 mt-1">
        </span>
      )}
    </div>
  );
}
