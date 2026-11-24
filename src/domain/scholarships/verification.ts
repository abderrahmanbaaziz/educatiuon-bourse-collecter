import type { AlgeriaEligibility, ApplicationStatus, OpportunityType, ScholarshipStatus, TrustLevel } from "@prisma/client";

export type VerificationFacts = { currentStatus: ScholarshipStatus; trustLevel: TrustLevel | null; evidenceFields: string[]; sourceUrl: string; applicationUrl: string | null; algeriaEligibility: AlgeriaEligibility; opportunityType: OpportunityType; applicationStatus: ApplicationStatus; directApplicationVerified: boolean };

export function evaluateVerification(facts: VerificationFacts) {
  const fields = new Set(facts.evidenceFields.map((field) => field.toLowerCase().replace(/[^a-z]/g, "")));
  const hasIdentity = [...fields].some((field) => field.includes("title") || field.includes("provider"));
  const hasCriticalDetail = [...fields].some((field) => /deadline|eligib|fund|tuition|stipend|application/.test(field));
  const trusted = facts.trustLevel === "OFFICIAL" || facts.trustLevel === "TRUSTED";
  let validApplicationUrl=true;let sameApplicationHost=true;
  if(facts.applicationUrl)try{const application=new URL(facts.applicationUrl,facts.sourceUrl);validApplicationUrl=["http:","https:"].includes(application.protocol);sameApplicationHost=application.hostname===new URL(facts.sourceUrl).hostname}catch{validApplicationUrl=false;sameApplicationHost=false}
  const externalApplicationSupported = [...fields].some((field) => field.includes("applicationurl") || field.includes("applicationprocess"));
  const reasons = [facts.algeriaEligibility !== "CONFIRMED" && "Algerian eligibility is not explicitly confirmed", facts.opportunityType !== "SCHOLARSHIP" && "record is not a scholarship funding opportunity", facts.applicationStatus !== "OPEN" && "applications are not confirmed open", !facts.directApplicationVerified && "direct application form or portal link is not verified", !trusted && "source is not trusted or official", !hasIdentity && "title/provider evidence is missing", !hasCriticalDetail && "critical eligibility, funding, deadline, or application evidence is missing", !validApplicationUrl && "application URL is invalid or unsafe", validApplicationUrl&&!sameApplicationHost&&!externalApplicationSupported && "external application URL lacks source evidence"].filter(Boolean) as string[];
  return { allowed: reasons.length === 0, reasons };
}

export const allowedTransitions: Record<ScholarshipStatus, ScholarshipStatus[]> = {
  DISCOVERED:["CRAWLING","REJECTED"], CRAWLING:["EXTRACTED","NEEDS_REVIEW","REJECTED"], EXTRACTED:["NEEDS_REVIEW","REJECTED"],
  NEEDS_REVIEW:["VERIFIED","REJECTED"], VERIFIED:["NEEDS_REVIEW","EXPIRED"], EXPIRED:["NEEDS_REVIEW"], REJECTED:["NEEDS_REVIEW"],
};
