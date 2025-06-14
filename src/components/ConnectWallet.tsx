import { useAccount } from "wagmi";
import { Account } from "@/components/Account";
import { WalletOptions } from "@/components/WalletOptions";

export function ConnectWallet() {
  const { isConnected } = useAccount();
  return <div>{isConnected ? <Account /> : <WalletOptions />}</div>;
}
