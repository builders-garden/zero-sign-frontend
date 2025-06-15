import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposalId, safeAddress, zkOwnerAddress, signature, zkProofData } =
      body;

    // Validate required fields
    if (
      !proposalId ||
      !safeAddress ||
      !zkOwnerAddress ||
      !signature ||
      !zkProofData
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: proposalId, safeAddress, zkOwnerAddress, signature, zkProofData",
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

    // Check if proof already exists for this proposal with the same signature
    const existingProof = await prisma.proof.findFirst({
      where: {
        proposalId: parseInt(proposalId),
        value: signature,
      },
    });

    if (existingProof) {
      // Update existing proof with ZK proof data
      const updatedProof = await prisma.proof.update({
        where: { id: existingProof.id },
        data: {
          zkProofData: JSON.stringify(zkProofData),
        },
      });

      return NextResponse.json({
        success: true,
        proof: updatedProof,
        message: "ZK proof data added to existing proof successfully",
      });
    } else {
      // Create new proof with ZK proof data
      const savedProof = await prisma.proof.create({
        data: {
          value: signature,
          proposalId: parseInt(proposalId),
          zkProofData: JSON.stringify(zkProofData),
        },
      });

      return NextResponse.json({
        success: true,
        proof: savedProof,
        message: "Proof with ZK data saved successfully",
      });
    }
  } catch (error) {
    console.error("Error saving ZK proof:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
