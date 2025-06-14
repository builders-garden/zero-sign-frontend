/*
  Warnings:

  - Added the required column `safeAddress` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zkOwnerAddress` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Safe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT,
    "zkOwnerAddress" TEXT NOT NULL,
    "signers" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deployed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "SafeSignature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signerAddress" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "safeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SafeSignature_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Proposal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "calldata" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "zkOwnerAddress" TEXT NOT NULL,
    "safeAddress" TEXT NOT NULL
);
INSERT INTO "new_Proposal" ("calldata", "id", "nonce", "threshold", "to", "value") SELECT "calldata", "id", "nonce", "threshold", "to", "value" FROM "Proposal";
DROP TABLE "Proposal";
ALTER TABLE "new_Proposal" RENAME TO "Proposal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Safe_address_key" ON "Safe"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Safe_zkOwnerAddress_key" ON "Safe"("zkOwnerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "SafeSignature_safeId_signerAddress_key" ON "SafeSignature"("safeId", "signerAddress");
