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

// Get all proposals for a specific Safe address
export async function getProposalsBySafeAddress(safeAddress: string) {
  return prisma.proposal.findMany({
    where: { safeAddress },
    include: { proofs: true },
    orderBy: { id: "desc" },
  });
}

// Get all proposals for a specific ZK owner address
export async function getProposalsByZkOwnerAddress(zkOwnerAddress: string) {
  return prisma.proposal.findMany({
    where: { zkOwnerAddress },
    include: { proofs: true },
    orderBy: { id: "desc" },
  });
}

// Get proof status for a specific proposal (committed vs missing)
export async function getProposalProofStatus(proposalId: number) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { proofs: true },
  });

  if (!proposal) {
    return null;
  }

  const committedProofs = proposal.proofs.length;
  const threshold = proposal.threshold;
  const missingProofs = Math.max(0, threshold - committedProofs);

  return {
    proposalId,
    threshold,
    committedProofs,
    missingProofs,
    isComplete: committedProofs >= threshold,
    proposal,
  };
}

// Add a proof to an existing proposal
export async function addProofToProposal(
  proposalId: number,
  proofValue: string
) {
  return prisma.proof.create({
    data: {
      value: proofValue,
      proposalId,
    },
  });
}

// Get proposals that are ready to execute (have enough proofs)
export async function getExecutableProposals(safeAddress?: string) {
  const whereClause = safeAddress ? { safeAddress } : {};

  const proposals = await prisma.proposal.findMany({
    where: whereClause,
    include: { proofs: true },
  });

  return proposals.filter(
    (proposal) => proposal.proofs.length >= proposal.threshold
  );
}

// Create a proposal with proofs
export async function createProposal(data: {
  calldata: string;
  to: string;
  value: string;
  nonce: number;
  threshold: number;
  zkOwnerAddress: string;
  safeAddress: string;
  proofs: string[];
}) {
  return prisma.proposal.create({
    data: {
      calldata: data.calldata,
      to: data.to,
      value: data.value,
      nonce: data.nonce,
      threshold: data.threshold,
      zkOwnerAddress: data.zkOwnerAddress,
      safeAddress: data.safeAddress,
      proofs: {
        create: data.proofs.map((value) => ({ value })),
      },
    },
    include: { proofs: true },
  });
}
