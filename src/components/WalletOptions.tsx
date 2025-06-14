import * as React from "react";
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";

export function WalletOptions() {
  const { connectors, connect, status } = useConnect();

  if (connectors.length === 0) {
    return <div className="text-red-500">No wallet connectors found.</div>;
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-4 py-2 text-sm shadow border-l-4 border-transparent hover:border-green-400 transition-all"
          disabled={!connector.ready || status === "pending"}
        >
          {connector.name === "Injected" ? "Connect Wallet" : connector.name}
          {status === "pending" && " (connecting...)"}
        </Button>
      ))}
    </div>
  );
}
