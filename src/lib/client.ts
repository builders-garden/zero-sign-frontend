import { PrismaClient } from "@prisma/client";

// Use local SQLite for now to avoid webpack issues with LibSQL adapter
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db",
    },
  },
});
