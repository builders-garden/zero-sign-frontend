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
import { prisma } from "@/lib/client";

export async function POST(request: NextRequest) {
  const { safeId } = await request.json();
  console.log("safeId", safeId);
  if (!safeId) {
    return NextResponse.json(
      { error: "Safe address is required" },
      { status: 400 }
    );
  }

  //read the safe from the database
  const safe = await prisma.safe.findUnique({
    where: {
      id: safeId,
    },
  });
  if (!safe) {
    return NextResponse.json({ error: "Safe not found" }, { status: 404 });
  }

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(),
    account: privateKeyToAccount(env.baseSepolia_PRIVATE_KEY as `0x${string}`),
  });

  //read the hashes from the database
  const hashes = await prisma.safeSignature.findMany({
    where: {
      safeId: safe.id,
    },
  });
  const signaturesHashes = hashes.map(
    (hash) => hash.signatureHash
  ) as `0x${string}`[];

  console.log("threshold", BigInt(safe.threshold));
  console.log("signaturesHashes", signaturesHashes);

  const deploy = await walletClient.writeContract({
    address: ZK_OWNER_FACTORY_ADDRESS,
    abi: ZK_OWNER_FACTORY_ABI,
    functionName: "deploy",
    args: [BigInt(safe.threshold), signaturesHashes],
  });
  if (!deploy) {
    return NextResponse.json({ error: "Failed to deploy" });
  }

  //check event
  const deployEvent = await publicClient.waitForTransactionReceipt({
    hash: deploy,
  });

  // Validate that we have logs
  if (!deployEvent.logs || deployEvent.logs.length === 0) {
    return NextResponse.json({ error: "No deployment event found" });
  }

  // Extract addresses from event topics (convert from 32-byte hex to 20-byte address)
  const safeAddressTopic = deployEvent.logs[0].topics[1];
  const zkOwnerAddressTopic = deployEvent.logs[0].topics[2];

  if (!safeAddressTopic || !zkOwnerAddressTopic) {
    return NextResponse.json({ error: "Invalid deployment event format" });
  }

  // Convert 32-byte topics to 20-byte addresses
  const safeAddress = `0x${safeAddressTopic.slice(-40)}` as `0x${string}`;
  const zkOwnerAddress = `0x${zkOwnerAddressTopic.slice(-40)}` as `0x${string}`;

  console.log("safeAddress", safeAddress);
  console.log("zkOwnerAddress", zkOwnerAddress);
  //update the safe with the address
  await prisma.safe.update({
    where: {
      id: safeId,
    },
    data: { address: safeAddress },
  });
  //verify the zkOwnerAddress
  if (zkOwnerAddress !== safe.zkOwnerAddress) {
    return NextResponse.json({ error: "ZK owner address does not match" });
  }

  return NextResponse.json({ safeAddress, zkOwnerAddress });
}
