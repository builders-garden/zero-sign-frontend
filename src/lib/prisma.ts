import { prisma } from "./client";

// Get all proposals with their proofs
export async function getProposals() {
  return prisma.proposal.findMany({ include: { proofs: true } });
}

// Get a single proposal by id with its proofs
export async function getProposalById(id: number) {
  return prisma.proposal.findUnique({
    where: { id },
    include: { proofs: true },
  });
}

// Create a proposal with proofs
export async function createProposal(data: {
  calldata: string;
  to: string;
  value: string;
  nonce: number;
  threshold: number;
  proofs: string[];
}) {
  return prisma.proposal.create({
    data: {
      calldata: data.calldata,
      to: data.to,
      value: data.value,
      nonce: data.nonce,
      threshold: data.threshold,
      proofs: {
        create: data.proofs.map((value) => ({ value })),
      },
    },
    include: { proofs: true },
  });
}
