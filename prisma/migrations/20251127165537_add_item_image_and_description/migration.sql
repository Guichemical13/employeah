/*
  Warnings:

  - Added the required column `updatedAt` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" VARCHAR(1000),
ADD COLUMN     "imageUrl" VARCHAR(500),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
