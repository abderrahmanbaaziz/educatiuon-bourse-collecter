ALTER TABLE "SearchRun"
  ADD COLUMN "uniqueDomainCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "queuedUrlCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "skippedUrlCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "trigger" TEXT NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "requestLabel" TEXT;

ALTER TABLE "SearchResult"
  ADD COLUMN "domain" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "isNew" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "crawlJobId" TEXT;

ALTER TABLE "Scholarship" ADD COLUMN "crawlJobId" TEXT;

ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_crawlJobId_fkey"
  FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_crawlJobId_fkey"
  FOREIGN KEY ("crawlJobId") REFERENCES "CrawlJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "SearchResult_crawlJobId_idx" ON "SearchResult"("crawlJobId");
CREATE INDEX "Scholarship_crawlJobId_idx" ON "Scholarship"("crawlJobId");
