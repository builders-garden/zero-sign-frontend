import { NextRequest, NextResponse } from "next/server";
import { createSafe } from "@/lib/prisma";
import {
  keccak256,
  encodePacked,
  getContractAddress,
  toBytes,
  createPublicClient,
  http,
  getAddress,
} from "viem";
import {
  ZK_OWNER_FACTORY_ABI,
  ZK_OWNER_FACTORY_ADDRESS,
} from "@/lib/constants";
import { baseSepolia } from "viem/chains";

export async function POST(request: NextRequest) {
  try {
    const { signerAddress, threshold } = await request.json();

    if (!signerAddress) {
      return NextResponse.json(
        { error: "Signer address is required" },
        { status: 400 }
      );
    }

    // Convert threshold to number and validate
    const thresholdNum = parseInt(threshold);
    if (!threshold || isNaN(thresholdNum) || thresholdNum < 1) {
      return NextResponse.json(
        { error: "Threshold must be a valid number at least 1" },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
    console.log("signerAddress", signerAddress);

    const nonce = await publicClient.readContract({
      address: ZK_OWNER_FACTORY_ADDRESS,
      abi: ZK_OWNER_FACTORY_ABI,
      functionName: "nonceByDeployer",
      args: [getAddress(signerAddress)],
    });
    console.log("nonce", nonce);

    const zkOwnerAddress = await publicClient.readContract({
      address: ZK_OWNER_FACTORY_ADDRESS,
      abi: ZK_OWNER_FACTORY_ABI,
      functionName: "precomputeAddress",
      args: [signerAddress, nonce],
    });
    console.log("zkOwnerAddress", zkOwnerAddress);
    console.log("threshold", thresholdNum);
    console.log("signerAddress", signerAddress);

    // Create Safe record in database
    const safe = await createSafe({
      zkOwnerAddress,
      signers: [signerAddress],
      threshold: thresholdNum,
    });

    return NextResponse.json({
      safeId: safe.id,
      zkOwnerAddress,
      threshold: thresholdNum,
    });
  } catch (error) {
    console.error("Error precomputing safe:", error);
    return NextResponse.json(
      { error: "Failed to precompute safe" },
      { status: 500 }
    );
  }
}
