import { NextRequest, NextResponse } from "next/server";
import { createProposal, getProposals } from "@/lib/prisma";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { SAFE_ABI, ZK_OWNER_ABI } from "@/lib/constants";
import { prisma } from "@/lib/client";

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
      chain: baseSepolia,
      transport: http(),
    });

    console.log("safeAddress", safeAddress);

    //read the safe info from db - try by address first, then by zkOwnerAddress
    let safeInfo = await prisma.safe.findUnique({
      where: {
        address: safeAddress,
      },
    });

    // If not found by address, try to find by zkOwnerAddress (for cases where address is still NULL)
    if (!safeInfo) {
      safeInfo = await prisma.safe.findUnique({
        where: {
          zkOwnerAddress: safeAddress,
        },
      });
    }

    console.log("safeInfo", safeInfo);

    if (!safeInfo) {
      return NextResponse.json(
        { error: "Safe info not found" },
        { status: 400 }
      );
    }

    const nonce = await publicClient.readContract({
      address: safeAddress,
      abi: SAFE_ABI,
      functionName: "nonce",
    });

    // Create the proposal in the database
    const proposal = await createProposal({
      calldata,
      to,
      value: value.toString(),
      nonce: Number(nonce) || 1,
      threshold: Number(safeInfo.threshold) || 2,
      zkOwnerAddress: safeInfo.zkOwnerAddress || safeAddress,
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
