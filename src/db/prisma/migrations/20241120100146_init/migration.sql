-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "site_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "worker_name" TEXT NOT NULL DEFAULT 'default',
    "last_scrape_time" TIMESTAMP(3),
    "scrape_frequency_seconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlTask" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error" TEXT,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "CrawlTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawledData" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "CrawledData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CrawlTask" ADD CONSTRAINT "CrawlTask_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledData" ADD CONSTRAINT "CrawledData_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
