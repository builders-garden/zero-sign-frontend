const { createClient } = require("@libsql/client");

// Load environment variables
require("dotenv").config();

async function checkProposals() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log("🔍 Checking proposals in database...");

    // Get all proposals
    const proposals = await client.execute(
      "SELECT * FROM Proposal ORDER BY id ASC"
    );

    console.log(`📋 Found ${proposals.rows.length} proposals:`);

    if (proposals.rows.length === 0) {
      console.log("❌ No proposals found in database");
      console.log(
        "💡 You need to create a proposal first at /app/proposal/new"
      );
    } else {
      proposals.rows.forEach((proposal) => {
        console.log(`\n📄 Proposal #${proposal.id}:`);
        console.log(`  - Safe: ${proposal.safeAddress}`);
        console.log(`  - To: ${proposal.to}`);
        console.log(`  - Value: ${proposal.value} ETH`);
        console.log(`  - Threshold: ${proposal.threshold}`);
        console.log(`  - ZK Owner: ${proposal.zkOwnerAddress}`);
      });

      console.log(`\n✅ Available proposal URLs:`);
      proposals.rows.forEach((proposal) => {
        console.log(`  - http://localhost:3000/app/proposal/${proposal.id}`);
      });
    }

    // Also check proofs for these proposals
    if (proposals.rows.length > 0) {
      console.log(`\n🔍 Checking proofs...`);
      const proofs = await client.execute("SELECT * FROM Proof");
      console.log(`📝 Found ${proofs.rows.length} proofs total`);
    }
  } catch (error) {
    console.error("❌ Error checking proposals:", error);
  } finally {
    client.close();
  }
}

checkProposals();
