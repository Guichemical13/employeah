-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetCode" VARCHAR(6),
ADD COLUMN     "resetCodeExpires" TIMESTAMP(3);
