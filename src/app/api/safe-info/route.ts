import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { SAFE_ABI, ZK_OWNER_ABI } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { safeAddress } = body;

    // Validate required fields
    if (!safeAddress) {
      return NextResponse.json(
        { error: "Safe address is required" },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    try {
      // Fetch nonce from Safe contract
      const nonce = await publicClient.readContract({
        address: safeAddress,
        abi: SAFE_ABI,
        functionName: "nonce",
      });

      // Fetch zkOwnerAddress from Safe contract
      const zkOwnerAddress = await publicClient.readContract({
        address: safeAddress,
        abi: SAFE_ABI,
        functionName: "owner",
      });

      // Fetch threshold from ZK Owner contract
      const threshold = await publicClient.readContract({
        address: zkOwnerAddress,
        abi: ZK_OWNER_ABI,
        functionName: "getThreshold",
      });

      return NextResponse.json({
        success: true,
        nonce: Number(nonce),
        threshold: Number(threshold),
        zkOwnerAddress: zkOwnerAddress,
        safeAddress: safeAddress,
      });
    } catch (contractError) {
      console.error("Contract interaction error:", contractError);
      return NextResponse.json(
        {
          error:
            "Failed to read from contracts. Please check the Safe address.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching Safe info:", error);
    return NextResponse.json(
      { error: "Failed to fetch Safe information" },
      { status: 500 }
    );
  }
}
