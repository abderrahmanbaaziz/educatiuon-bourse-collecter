CREATE TYPE "AlgeriaEligibility" AS ENUM ('CONFIRMED', 'NOT_ELIGIBLE', 'UNKNOWN');
CREATE TYPE "OpportunityType" AS ENUM ('SCHOLARSHIP', 'INVITATION', 'CONFERENCE', 'TRAINING', 'EXCHANGE_NOTICE', 'OTHER', 'UNKNOWN');
CREATE TYPE "ApplicationStatus" AS ENUM ('OPEN', 'UPCOMING', 'CLOSED', 'UNKNOWN');

ALTER TABLE "Scholarship"
  ADD COLUMN "algeriaEligibility" "AlgeriaEligibility" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "eligibilityReason" TEXT,
  ADD COLUMN "opportunityType" "OpportunityType" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "directApplicationVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "rejectionReason" TEXT;
