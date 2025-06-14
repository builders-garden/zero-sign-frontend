import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql/web";
import { env } from "./env";

// Create Prisma adapter for Turso (using web/edge version)
const adapter = new PrismaLibSQL({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

// Create Prisma client with LibSQL adapter
export const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});
