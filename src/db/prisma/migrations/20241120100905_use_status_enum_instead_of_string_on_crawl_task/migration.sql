/*
  Warnings:

  - The `status` column on the `CrawlTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CrawlTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "CrawlTask" DROP COLUMN "status",
ADD COLUMN     "status" "CrawlTaskStatus" NOT NULL DEFAULT 'PENDING';
