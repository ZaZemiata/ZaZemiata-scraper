/*
  Warnings:

  - A unique constraint covering the columns `[contractor,date,source_url_id]` on the table `CrawledData` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CrawledData_text_contractor_date_source_url_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "CrawledData_contractor_date_source_url_id_key" ON "CrawledData"("contractor", "date", "source_url_id");
