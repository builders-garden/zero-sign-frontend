import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ safeAddress: string }> }
) {
  try {
    const { safeAddress } = await params;

    if (!safeAddress) {
      return NextResponse.json(
        { success: false, error: "Safe address is required" },
        { status: 400 }
      );
    }

    // Find the safe by address (or by ID if it's actually an ID)
    let safe = await prisma.safe.findUnique({
      where: {
        address: safeAddress,
      },
    });

    // If not found by address, try by ID
    if (!safe) {
      safe = await prisma.safe.findUnique({
        where: {
          id: safeAddress,
        },
      });
    }

    if (!safe) {
      return NextResponse.json(
        { success: false, error: "Safe not found" },
        { status: 404 }
      );
    }

    // Get safe signatures hashes from the safe
    const signaturesHashes = await prisma.safeSignature.findMany({
      where: {
        safeId: safe.id,
      },
      select: {
        signatureHash: true,
        signerAddress: true,
        createdAt: true,
      },
    });

    // Extract just the signature hashes for the ZK proof
    const signatureHashes = signaturesHashes.map(
      (signature) => signature.signatureHash
    );

    return NextResponse.json({
      success: true,
      signatureHashes,
      signatures: signaturesHashes, // Include full signature data if needed
      count: signaturesHashes.length,
    });
  } catch (error) {
    console.error("Error fetching safe signatures:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch safe signatures" },
      { status: 500 }
    );
  }
}
