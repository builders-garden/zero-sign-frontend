import {
  ZK_OWNER_ABI,
  ZK_OWNER_FACTORY_ABI,
  ZK_OWNER_FACTORY_ADDRESS,
} from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const { threshold, signers } = await request.json();
  if (!Array.isArray(signers)) {
    return NextResponse.json(
      { error: "Signers must be an array of addresses" },
      { status: 400 }
    );
  }

  //TODO: do somethig for creating the encoded data for the initData
  const initData: `0x${string}` = "0x";

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(),
    account: privateKeyToAccount(env.baseSepolia_PRIVATE_KEY as `0x${string}`),
  });

  const deploy = await walletClient.writeContract({
    address: ZK_OWNER_FACTORY_ADDRESS,
    abi: ZK_OWNER_FACTORY_ABI,
    functionName: "deploy",
    args: [initData, threshold],
  });
  if (!deploy) {
    return NextResponse.json({ error: "Failed to deploy" });
  }

  //check event
  const deployEvent = await publicClient.waitForTransactionReceipt({
    hash: deploy,
  });
  const safeAddress = deployEvent.logs[0].topics[1];
  const zkOwnerAddress = deployEvent.logs[0].topics[2];

  return NextResponse.json({ safeAddress, zkOwnerAddress });
}
