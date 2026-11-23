CREATE TABLE "ScholarshipStatusHistory" (
  "id" TEXT PRIMARY KEY,
  "scholarshipId" TEXT NOT NULL REFERENCES "Scholarship"("id") ON DELETE CASCADE,
  "fromStatus" "ScholarshipStatus",
  "toStatus" "ScholarshipStatus" NOT NULL,
  "reason" TEXT NOT NULL,
  "actor" TEXT NOT NULL DEFAULT 'administrator',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "ScholarshipStatusHistory_scholarshipId_createdAt_idx" ON "ScholarshipStatusHistory"("scholarshipId", "createdAt");
