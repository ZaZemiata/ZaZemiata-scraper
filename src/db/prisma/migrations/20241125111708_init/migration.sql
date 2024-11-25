-- CreateEnum
CREATE TYPE "CrawlTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "Sources" (
    "id" BIGINT NOT NULL,
    "site_name" TEXT NOT NULL,
    "worker_name" TEXT NOT NULL,
    "last_scrape_time" TIMESTAMP(3),
    "scrape_frequency_seconds" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceUrls" (
    "id" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_id" BIGINT NOT NULL,

    CONSTRAINT "SourceUrls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlTasks" (
    "id" BIGSERIAL NOT NULL,
    "status" "CrawlTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrawlTasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawledData" (
    "id" BIGSERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "Contractor" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_url" BIGINT NOT NULL,

    CONSTRAINT "CrawledData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_id" BIGINT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyWords" (
    "id" BIGSERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyWords_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SourceUrls" ADD CONSTRAINT "SourceUrls_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "Sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledData" ADD CONSTRAINT "CrawledData_source_url_fkey" FOREIGN KEY ("source_url") REFERENCES "SourceUrls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "Sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
