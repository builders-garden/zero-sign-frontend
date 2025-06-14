"use client";
import { Sidebar } from "@/components/Sidebar";
import { ReactNode, createContext, useContext, useState } from "react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useAccount } from "wagmi";

// Context for the connected ZK Safe
const ConnectedSafeContext = createContext<{
  connectedSafe: string | undefined;
  setConnectedSafe: (address: string | undefined) => void;
}>({ connectedSafe: undefined, setConnectedSafe: () => {} });

export function useConnectedSafe() {
  return useContext(ConnectedSafeContext);
}

export default function AppLayoutClient({ children }: { children: ReactNode }) {
  const [connectedSafe, setConnectedSafe] = useState<string | undefined>(
    undefined
  );

  return (
    <ConnectedSafeContext.Provider value={{ connectedSafe, setConnectedSafe }}>
      <div className="flex min-h-screen bg-neutral-950">
        <Sidebar connectedSafe={connectedSafe} />
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="w-full flex justify-end items-center h-16 px-8 bg-neutral-950">
            <ConnectWallet />
          </div>
          {/* Main content */}
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ConnectedSafeContext.Provider>
  );
}
