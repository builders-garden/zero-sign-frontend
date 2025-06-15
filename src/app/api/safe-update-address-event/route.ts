import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/client";

export async function POST(request: NextRequest) {
  const { safeId, safeProxyAddress, deployedAddress, transactionHash } =
    await request.json();
  console.log("Event data received:", {
    safeId,
    safeProxyAddress,
    deployedAddress,
    transactionHash,
  });

  if (!safeId || !safeProxyAddress || !deployedAddress) {
    return NextResponse.json(
      { error: "Safe ID, safeProxyAddress, and deployedAddress are required" },
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

    console.log("Safe found:", safe);
    console.log("Event addresses:", { safeProxyAddress, deployedAddress });

    // In the ContractDeployed event:
    // - safeProxyAddress is the Safe proxy address
    // - deployedAddress is the ZK Owner contract address
    const safeAddress = safeProxyAddress;
    const zkOwnerAddress = deployedAddress;

    // Verify the zkOwnerAddress matches what we expect
    if (zkOwnerAddress.toLowerCase() !== safe.zkOwnerAddress.toLowerCase()) {
      console.log("ZK Owner address mismatch:", {
        expected: safe.zkOwnerAddress,
        received: zkOwnerAddress,
      });
      return NextResponse.json({
        error: `ZK owner address does not match. Expected: ${safe.zkOwnerAddress}, Received: ${zkOwnerAddress}`,
      });
    }

    // Update the safe with the deployed address
    await prisma.safe.update({
      where: {
        id: safeId,
      },
      data: { address: safeAddress },
    });

    console.log("Safe updated successfully:", { safeAddress, zkOwnerAddress });

    return NextResponse.json({ safeAddress, zkOwnerAddress });
  } catch (error) {
    console.error("Error updating safe address with event data:", error);
    return NextResponse.json(
      { error: "Failed to update safe address" },
      { status: 500 }
    );
  }
}
