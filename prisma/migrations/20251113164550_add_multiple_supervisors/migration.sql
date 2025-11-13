/*
  Warnings:

  - You are about to drop the column `supervisorId` on the `Team` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_supervisorId_fkey";

-- DropIndex
DROP INDEX "Team_supervisorId_idx";

-- DropIndex
DROP INDEX "Team_supervisorId_key";

-- CreateTable (criar antes de dropar a coluna)
CREATE TABLE "_TeamSupervisors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TeamSupervisors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TeamSupervisors_B_index" ON "_TeamSupervisors"("B");

-- AddForeignKey
ALTER TABLE "_TeamSupervisors" ADD CONSTRAINT "_TeamSupervisors_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamSupervisors" ADD CONSTRAINT "_TeamSupervisors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing supervisors to new table
INSERT INTO "_TeamSupervisors" ("A", "B")
SELECT "id", "supervisorId"
FROM "Team"
WHERE "supervisorId" IS NOT NULL;

-- AlterTable (agora podemos dropar a coluna)
ALTER TABLE "Team" DROP COLUMN "supervisorId";
