import { createClient } from "@libsql/client";
import { config } from "dotenv";

config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkSchema() {
  try {
    const result = await client.execute("PRAGMA table_info(Proof);");
    console.log("Proof table columns:");
    result.rows.forEach((row) => {
      console.log(`- ${row.name} (${row.type})`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.close();
  }
}

checkSchema();
