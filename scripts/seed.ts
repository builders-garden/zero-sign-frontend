import { prisma } from "../src/lib/client";

async function main() {
  // Step 1: Create the proposal (without proofs)
  const proposal = await prisma.proposal.create({
    data: {
      calldata: "0x123456",
      to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      value: "1000000000000000000",
      nonce: 1,
      threshold: 2,
      zkOwnerAddress: "0x1234567890123456789012345678901234567890",
      safeAddress: "0x9876543210987654321098765432109876543210",
    },
  });

  // Step 2: Create proofs linked to the proposal
  await prisma.proof.createMany({
    data: [
      { value: "proof1", proposalId: proposal.id },
      { value: "proof2", proposalId: proposal.id },
    ],
  });

  // Step 3: Fetch the proposal with proofs
  const fullProposal = await prisma.proposal.findUnique({
    where: { id: proposal.id },
    include: { proofs: true },
  });

  console.log("Created proposal:", fullProposal);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
