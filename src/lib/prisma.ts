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

// Safe operations
export async function createSafe(data: {
  zkOwnerAddress: string;
  signers?: string[];
  threshold?: number;
}) {
  return prisma.safe.create({
    data: {
      zkOwnerAddress: data.zkOwnerAddress,
      signers: JSON.stringify(data.signers || []),
      threshold: data.threshold || 1,
    },
    include: { signatures: true },
  });
}

export async function updateSafe(
  id: string,
  data: {
    signers?: string[];
    threshold?: number;
    address?: string;
    deployed?: boolean;
  }
) {
  const updateData: any = {};

  if (data.signers) {
    updateData.signers = JSON.stringify(data.signers);
  }
  if (data.threshold !== undefined) {
    updateData.threshold = data.threshold;
  }
  if (data.address !== undefined) {
    updateData.address = data.address;
  }
  if (data.deployed !== undefined) {
    updateData.deployed = data.deployed;
  }

  return prisma.safe.update({
    where: { id },
    data: updateData,
    include: { signatures: true },
  });
}

export async function getSafeById(id: string) {
  const safe = await prisma.safe.findUnique({
    where: { id },
    include: { signatures: true },
  });

  if (safe) {
    return {
      ...safe,
      signers: JSON.parse(safe.signers),
    };
  }
  return null;
}

export async function getSafeByZkOwnerAddress(zkOwnerAddress: string) {
  const safe = await prisma.safe.findUnique({
    where: { zkOwnerAddress },
    include: { signatures: true },
  });

  if (safe) {
    return {
      ...safe,
      signers: JSON.parse(safe.signers),
    };
  }
  return null;
}

export async function addSignatureToSafe(data: {
  safeId: string;
  signerAddress: string;
  signature: string;
  signatureHash: string;
}) {
  return prisma.safeSignature.create({
    data: {
      safeId: data.safeId,
      signerAddress: data.signerAddress,
      signatureHash: data.signatureHash,
      signature: data.signature,
    },
  });
}

export async function deploySafe(safeId: string, address: string) {
  return prisma.safe.update({
    where: { id: safeId },
    data: {
      address,
      deployed: true,
    },
  });
}
