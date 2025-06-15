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
    console.log("safe", safe);

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
    console.log("signaturesHashes", signaturesHashes);

    // Extract just the signature hashes for the ZK proof
    const signatureHashes = signaturesHashes.map(
      (signature) => signature.signatureHash
    );

    // TEMPORARY: If no signatures exist, return mock data for testing
    if (signatureHashes.length === 0) {
      const mockSignatureHashes = [
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      ];
      console.log("Using mock signature hashes for testing");
      return NextResponse.json({
        success: true,
        signatureHashes: mockSignatureHashes,
        signatures: [],
        count: mockSignatureHashes.length,
        mock: true, // Indicate this is mock data
      });
    }

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
