import { NextRequest, NextResponse } from "next/server";
import { getProposalsBySafeAddress } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const safeAddress = decodeURIComponent(address);

    if (!safeAddress) {
      return NextResponse.json(
        { error: "Safe address is required" },
        { status: 400 }
      );
    }

    const proposals = await getProposalsBySafeAddress(safeAddress);

    return NextResponse.json({
      success: true,
      proposals,
      count: proposals.length,
    });
  } catch (error) {
    console.error("Error fetching proposals by Safe address:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}
