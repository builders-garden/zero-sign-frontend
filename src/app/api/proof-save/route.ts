import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { safeAddress, zkOwnerAddress, proposalId, proof } = body;

    // Validate required fields
    if (!safeAddress || !zkOwnerAddress || !proposalId || !proof) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: safeAddress, zkOwnerAddress, proposalId, proof",
        },
        { status: 400 }
      );
    }

    // Validate that the proposal exists with the given safe address and zk owner address
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: parseInt(proposalId),
        safeAddress: safeAddress,
        zkOwnerAddress: zkOwnerAddress,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        {
          error:
            "Proposal not found or does not match the provided safe address and zk owner address",
        },
        { status: 404 }
      );
    }

    // Check if proof already exists for this proposal
    const existingProof = await prisma.proof.findFirst({
      where: {
        proposalId: parseInt(proposalId),
        value: proof,
      },
    });

    if (existingProof) {
      return NextResponse.json(
        { error: "Proof already exists for this proposal" },
        { status: 409 }
      );
    }

    // Save the proof
    const savedProof = await prisma.proof.create({
      data: {
        value: proof,
        proposalId: parseInt(proposalId),
      },
    });

    return NextResponse.json({
      success: true,
      proof: savedProof,
      message: "Proof saved successfully",
    });
  } catch (error) {
    console.error("Error saving proof:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
