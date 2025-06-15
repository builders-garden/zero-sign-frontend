import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { prisma } from "@/lib/client";

export async function POST(request: NextRequest) {
  const { safeId, transactionHash } = await request.json();
  console.log("safeId", safeId, "transactionHash", transactionHash);

  if (!safeId || !transactionHash) {
    return NextResponse.json(
      { error: "Safe ID and transaction hash are required" },
      { status: 400 }
    );
  }

  try {
    // Read the safe from the database
    const safe = await prisma.safe.findUnique({
      where: {
        id: safeId,
      },
    });

    if (!safe) {
      return NextResponse.json({ error: "Safe not found" }, { status: 404 });
    }

    // Create public client to read transaction receipt
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    // Get transaction receipt
    const deployEvent = await publicClient.waitForTransactionReceipt({
      hash: transactionHash as `0x${string}`,
    });

    // Validate that we have logs
    if (!deployEvent.logs || deployEvent.logs.length === 0) {
      return NextResponse.json({ error: "No deployment event found" });
    }

    // Extract addresses from event topics (convert from 32-byte hex to 20-byte address)
    const safeAddressTopic = deployEvent.logs[0].topics[1];
    const zkOwnerAddressTopic = deployEvent.logs[0].topics[2];

    console.log("safeAddressTopic", safeAddressTopic);
    console.log("zkOwnerAddressTopic", zkOwnerAddressTopic);

    if (!safeAddressTopic || !zkOwnerAddressTopic) {
      return NextResponse.json({ error: "Invalid deployment event format" });
    }

    // Convert 32-byte topics to 20-byte addresses
    const safeAddress = `0x${safeAddressTopic.slice(-40)}` as `0x${string}`;
    const zkOwnerAddress = `0x${zkOwnerAddressTopic.slice(
      -40
    )}` as `0x${string}`;

    console.log("safeAddress", safeAddress);
    console.log("zkOwnerAddress", zkOwnerAddress);

    // Verify the zkOwnerAddress matches what we expect
    if (zkOwnerAddress.toLowerCase() !== safe.zkOwnerAddress.toLowerCase()) {
      return NextResponse.json({
        error: "ZK owner address does not match expected value",
      });
    }

    // Update the safe with the deployed address
    await prisma.safe.update({
      where: {
        id: safeId,
      },
      data: { address: safeAddress },
    });

    return NextResponse.json({ safeAddress, zkOwnerAddress });
  } catch (error) {
    console.error("Error updating safe address:", error);
    return NextResponse.json(
      { error: "Failed to update safe address" },
      { status: 500 }
    );
  }
}
