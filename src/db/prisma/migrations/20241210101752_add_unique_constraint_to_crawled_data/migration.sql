/*
  Warnings:

  - A unique constraint covering the columns `[text,contractor,source_url_id]` on the table `CrawledData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CrawledData_text_contractor_source_url_id_key" ON "CrawledData"("text", "contractor", "source_url_id");
