/*
  Warnings:

  - You are about to drop the column `Contractor` on the `CrawledData` table. All the data in the column will be lost.
  - Added the required column `contractor` to the `CrawledData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CrawledData" DROP COLUMN "Contractor",
ADD COLUMN     "contractor" TEXT NOT NULL;
