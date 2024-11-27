/*
  Warnings:

  - Added the required column `source_id` to the `CrawlTasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CrawlTasks" ADD COLUMN     "source_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "CrawlTasks" ADD CONSTRAINT "CrawlTasks_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "Sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
