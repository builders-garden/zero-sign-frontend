import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/client";

export async function POST(request: NextRequest) {
  const { safeId } = await request.json();
  console.log("safeId", safeId);

  if (!safeId) {
    return NextResponse.json({ error: "Safe ID is required" }, { status: 400 });
  }

  try {
    // Read the safe from the database
    const safe = await prisma.safe.findUnique({
      where: {
        id: safeId,
      },
    });

    if (!safe) {
      return NextResponse.json({ error: "Safe not found" }, { status: 404 });
    }

    // Read the signature hashes from the database
    const hashes = await prisma.safeSignature.findMany({
      where: {
        safeId: safe.id,
      },
    });

    const signaturesHashes = hashes.map(
      (hash) => hash.signatureHash
    ) as `0x${string}`[];

    console.log("threshold", safe.threshold);
    console.log("signaturesHashes", signaturesHashes);

    return NextResponse.json({
      threshold: safe.threshold,
      signaturesHashes,
    });
  } catch (error) {
    console.error("Error fetching deployment data:", error);
    return NextResponse.json(
      { error: "Failed to fetch deployment data" },
      { status: 500 }
    );
  }
}
