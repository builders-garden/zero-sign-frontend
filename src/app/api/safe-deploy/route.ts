import { NextRequest, NextResponse } from "next/server";
import { getSafeById, deploySafe } from "@/lib/prisma";
import {
  ZK_OWNER_FACTORY_ABI,
  ZK_OWNER_FACTORY_ADDRESS,
} from "@/lib/constants";
import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const { safeId } = await request.json();

    if (!safeId) {
      return NextResponse.json(
        { error: "safeId is required" },
        { status: 400 }
      );
    }

    // Get Safe from database
    const safe = await getSafeById(safeId);
    if (!safe) {
      return NextResponse.json({ error: "Safe not found" }, { status: 404 });
    }

    // Check if already deployed
    if (safe.deployed) {
      return NextResponse.json(
        { error: "Safe is already deployed", address: safe.address },
        { status: 400 }
      );
    }

    // Check if we have enough signatures
    if (safe.signatures.length < safe.threshold) {
      return NextResponse.json(
        {
          error: "Not enough signatures",
          required: safe.threshold,
          current: safe.signatures.length,
        },
        { status: 400 }
      );
    }

    // TODO: Create proper initData for the ZK owner based on signers and signatures
    const initData: `0x${string}` = "0x";

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: http(),
      account: privateKeyToAccount(
        env.baseSepolia_PRIVATE_KEY as `0x${string}`
      ),
    });

    // Deploy the Safe through the factory
    const deployTx = await walletClient.writeContract({
      address: ZK_OWNER_FACTORY_ADDRESS,
      abi: ZK_OWNER_FACTORY_ABI,
      functionName: "deploy",
      args: [initData, BigInt(safe.threshold)],
    });

    if (!deployTx) {
      return NextResponse.json(
        { error: "Failed to deploy Safe" },
        { status: 500 }
      );
    }

    // Wait for deployment and get the deployed addresses
    const deployReceipt = await publicClient.waitForTransactionReceipt({
      hash: deployTx,
    });

    const safeAddress = deployReceipt.logs[0]?.topics[1];
    const zkOwnerAddress = deployReceipt.logs[0]?.topics[2];

    if (!safeAddress) {
      return NextResponse.json(
        { error: "Failed to get deployed Safe address" },
        { status: 500 }
      );
    }

    // Update Safe in database
    const updatedSafe = await deploySafe(safeId, safeAddress);

    return NextResponse.json({
      success: true,
      safeAddress: updatedSafe.address,
      zkOwnerAddress,
      transactionHash: deployTx,
      deployed: true,
    });
  } catch (error) {
    console.error("Error deploying safe:", error);
    return NextResponse.json(
      { error: "Failed to deploy safe" },
      { status: 500 }
    );
  }
}
