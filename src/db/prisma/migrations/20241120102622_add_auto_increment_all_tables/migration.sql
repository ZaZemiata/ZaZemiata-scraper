/*
  Warnings:

  - The primary key for the `CrawlTask` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CrawlTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `CrawledData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CrawledData` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Source` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Source` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `sourceId` on the `CrawlTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sourceId` on the `CrawledData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "CrawlTask" DROP CONSTRAINT "CrawlTask_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "CrawledData" DROP CONSTRAINT "CrawledData_sourceId_fkey";

-- AlterTable
ALTER TABLE "CrawlTask" DROP CONSTRAINT "CrawlTask_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "sourceId",
ADD COLUMN     "sourceId" BIGINT NOT NULL,
ADD CONSTRAINT "CrawlTask_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CrawledData" DROP CONSTRAINT "CrawledData_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "sourceId",
ADD COLUMN     "sourceId" BIGINT NOT NULL,
ADD CONSTRAINT "CrawledData_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Source" DROP CONSTRAINT "Source_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Source_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "CrawlTask" ADD CONSTRAINT "CrawlTask_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledData" ADD CONSTRAINT "CrawledData_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
