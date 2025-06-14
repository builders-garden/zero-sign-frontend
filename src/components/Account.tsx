import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { Button } from "@/components/ui/button";

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  return (
    <div className="flex items-center gap-3">
      {ensAvatar && (
        <img
          alt="ENS Avatar"
          src={ensAvatar}
          className="w-8 h-8 rounded-full border border-green-500"
        />
      )}
      {address && (
        <div className="text-sm text-neutral-200 font-mono">
          {ensName ? `${ensName} (${address})` : address}
        </div>
      )}
      <Button
        onClick={() => disconnect()}
        className="bg-neutral-800 hover:bg-red-500 text-white font-bold rounded-xl px-3 py-1 text-xs ml-2 border border-neutral-700"
      >
        Disconnect
      </Button>
    </div>
  );
}
