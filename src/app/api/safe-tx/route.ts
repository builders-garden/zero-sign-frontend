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
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const { safeAddress, zkOwnerAddress, to, data, value, proof } =
    await request.json();
  if (!safeAddress || !zkOwnerAddress || to || !data || !value || !proof) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // prepare the signature data for safe - like https://docs.safe.global/advanced/smart-account-signatures#contract-signature-eip-1271
  console.log("toBytes(proof).length", toBytes(proof).length);
  console.log("toBytes(proof).length/2", toBytes(proof).length / 2);
  console.log("proof.length/2", proof.length / 2);
  const signature = concat([
    pad(zkOwnerAddress, { size: 32 }),
    toHex(65, { size: 32 }),
    "0x00",
    toHex(toBytes(proof).length, { size: 32 }),
    proof,
  ]);
  console.log("signature", signature);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(),
    account: privateKeyToAccount(env.baseSepolia_PRIVATE_KEY as `0x${string}`),
  });

  const transaction = await walletClient.writeContract({
    address: safeAddress,
    abi: SAFE_ABI,
    functionName: "execTransaction",
    args: [
      to,
      value,
      data,
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

  return NextResponse.json({ transaction });
}
