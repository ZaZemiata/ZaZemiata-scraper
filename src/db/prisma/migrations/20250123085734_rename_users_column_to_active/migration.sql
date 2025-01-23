/*
  Warnings:

  - You are about to drop the column `is_active` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "is_active",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
