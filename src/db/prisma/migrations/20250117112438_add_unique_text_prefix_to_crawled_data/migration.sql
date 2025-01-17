-- Add unique index on the first 300 characters of `text`
CREATE UNIQUE INDEX unique_text_prefix ON "CrawledData" (LEFT("text", 300));