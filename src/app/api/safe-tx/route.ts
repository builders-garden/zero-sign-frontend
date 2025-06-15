import {
  EMPTY_ADDRESS,
  SAFE_ABI,
  ZK_OWNER_ABI,
  ZK_OWNER_FACTORY_ABI,
  ZK_OWNER_FACTORY_ADDRESS,
} from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  createWalletClient,
  toBytes,
  concat,
  pad,
  toHex,
  encodeFunctionData,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { env } from "@/lib/env";
import { prisma } from "@/lib/client";

export async function POST(request: NextRequest) {
  const { safeAddress, zkOwnerAddress, to, data, value, recursiveProof } =
    await request.json();

  console.log("safeAddress", safeAddress);
  console.log("zkOwnerAddress", zkOwnerAddress);
  console.log("to", to);
  console.log("data", data);
  console.log("value", value);
  //console.log("recursiveProof", recursiveProof);



  // prepare the signature data for safe 
  console.log("toBytes(recursiveProof).length", toBytes(recursiveProof).length);
  console.log("toBytes(recursiveProof).length/2", toBytes(recursiveProof).length / 2);
  console.log("recursiveProof.length/2", recursiveProof.length / 2);
  const signature = concat([
    pad(zkOwnerAddress, { size: 32 }),
    toHex(65, { size: 32 }),
    "0x00",
    toHex(toBytes(recursiveProof).length, { size: 32 }),
    recursiveProof,
  ]);
  //console.log("signature", signature);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(),
    account: privateKeyToAccount(env.baseSepolia_PRIVATE_KEY as `0x${string}`),
  });

  const encodedData = encodeFunctionData({
    abi: SAFE_ABI,
    functionName: "execTransaction",
    args: [to, value, data, 0, BigInt(0), BigInt(0), BigInt(0), EMPTY_ADDRESS, EMPTY_ADDRESS, signature as `0x${string}`],
  });
  console.log("encodedData", encodedData);

  const transaction = await walletClient.writeContract({
    address: safeAddress,
    abi: SAFE_ABI,
    functionName: "execTransaction",
    args: [
      to,
      value,
      "0x00",
      0,
      BigInt(0),
      BigInt(0),
      BigInt(0),
      EMPTY_ADDRESS,
      EMPTY_ADDRESS,
      signature as `0x${string}`,
    ],
  });
  if (!transaction) {
    return NextResponse.json({ error: "Failed to deploy" });
  }
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transaction,
  });
  if (!receipt) {
    return NextResponse.json({ error: "Failed to deploy" });
  }


  return NextResponse.json({ "transaction": "transaction" });
}
