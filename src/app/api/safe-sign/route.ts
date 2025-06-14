import { NextRequest, NextResponse } from "next/server";
import { addSignatureToSafe, getSafeById } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { safeId, signerAddress, signature } = await request.json();

    if (!safeId || !signerAddress || !signature) {
      return NextResponse.json(
        { error: "safeId, signerAddress, and signature are required" },
        { status: 400 }
      );
    }

    // Verify the safe exists
    const safe = await getSafeById(safeId);
    if (!safe) {
      return NextResponse.json({ error: "Safe not found" }, { status: 404 });
    }

    // Add signature
    const newSignature = await addSignatureToSafe({
      safeId,
      signerAddress,
      signature,
    });

    // Get updated safe with all signatures
    const updatedSafe = await getSafeById(safeId);

    return NextResponse.json({
      success: true,
      signature: newSignature,
      signatureCount: updatedSafe?.signatures.length || 0,
      threshold: safe.threshold,
      isReady: (updatedSafe?.signatures.length || 0) >= safe.threshold,
    });
  } catch (error) {
    console.error("Error adding signature:", error);
    return NextResponse.json(
      { error: "Failed to add signature" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const safeId = searchParams.get("safeId");

    if (!safeId) {
      return NextResponse.json(
        { error: "safeId is required" },
        { status: 400 }
      );
    }

    const safe = await getSafeById(safeId);
    if (!safe) {
      return NextResponse.json({ error: "Safe not found" }, { status: 404 });
    }

    return NextResponse.json({
      safeId: safe.id,
      zkOwnerAddress: safe.zkOwnerAddress,
      signers: safe.signers,
      threshold: safe.threshold,
      signatures: safe.signatures,
      signatureCount: safe.signatures.length,
      isReady: safe.signatures.length >= safe.threshold,
      deployed: safe.deployed,
      address: safe.address,
    });
  } catch (error) {
    console.error("Error fetching safe:", error);
    return NextResponse.json(
      { error: "Failed to fetch safe" },
      { status: 500 }
    );
  }
}
