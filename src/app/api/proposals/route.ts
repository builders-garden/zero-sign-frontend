import { NextRequest, NextResponse } from "next/server";
import { createProposal, getProposals } from "@/lib/prisma";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { SAFE_ABI, ZK_OWNER_ABI } from "@/lib/constants";

export async function GET() {
  try {
    const proposals = await getProposals();
    return NextResponse.json({
      success: true,
      proposals,
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, calldata, value, safeAddress } = body;

    // Validate required fields
    if (!to || !calldata || !value || !safeAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const nonce = await publicClient.readContract({
      address: safeAddress,
      abi: SAFE_ABI,
      functionName: "nonce",
    });

    const zkOwnerAddress = await publicClient.readContract({
      address: safeAddress,
      abi: SAFE_ABI,
      functionName: "owner",
    });

    const threshold = await publicClient.readContract({
      address: zkOwnerAddress,
      abi: ZK_OWNER_ABI,
      functionName: "getThreshold",
    });

    // Create the proposal in the database
    const proposal = await createProposal({
      calldata,
      to,
      value: value.toString(),
      nonce: Number(nonce) || 1,
      threshold: Number(threshold) || 2,
      zkOwnerAddress: zkOwnerAddress || safeAddress,
      safeAddress: safeAddress,
      proofs: [], // Start with no proofs
    });

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}
