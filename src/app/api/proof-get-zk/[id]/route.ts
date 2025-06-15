import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Proof ID is required" },
        { status: 400 }
      );
    }

    const proofId = parseInt(id);
    if (isNaN(proofId)) {
      return NextResponse.json(
        { success: false, error: "Invalid proof ID" },
        { status: 400 }
      );
    }

    // Get proof with ZK data
    const proof = await prisma.proof.findUnique({
      where: { id: proofId },
      include: { proposal: true },
    });

    if (!proof) {
      return NextResponse.json(
        { success: false, error: "Proof not found" },
        { status: 404 }
      );
    }

    // Parse ZK proof data if it exists
    let zkProofData = null;
    if (proof.zkProofData) {
      try {
        zkProofData = JSON.parse(proof.zkProofData);
      } catch (error) {
        console.error("Error parsing ZK proof data:", error);
      }
    }

    return NextResponse.json({
      success: true,
      proof: {
        ...proof,
        zkProofData,
      },
    });
  } catch (error) {
    console.error("Error fetching proof with ZK data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch proof" },
      { status: 500 }
    );
  }
}
