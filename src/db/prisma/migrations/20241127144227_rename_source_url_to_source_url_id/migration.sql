/*
  Warnings:

  - You are about to drop the column `source_url` on the `CrawledData` table. All the data in the column will be lost.
  - Added the required column `source_id` to the `CrawlTasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source_url_id` to the `CrawledData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CrawledData" DROP CONSTRAINT "CrawledData_source_url_fkey";

-- AlterTable
ALTER TABLE "CrawlTasks" ADD COLUMN     "source_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "CrawledData" DROP COLUMN "source_url",
ADD COLUMN     "source_url_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "CrawlTasks" ADD CONSTRAINT "CrawlTasks_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "Sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledData" ADD CONSTRAINT "CrawledData_source_url_id_fkey" FOREIGN KEY ("source_url_id") REFERENCES "SourceUrls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
