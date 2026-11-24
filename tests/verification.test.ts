import { describe, expect, it } from "vitest";
import { evaluateVerification, type VerificationFacts } from "@/domain/scholarships/verification";

const valid: VerificationFacts = {
  currentStatus: "NEEDS_REVIEW", trustLevel: "OFFICIAL", evidenceFields: ["title", "eligibility", "application_url"],
  sourceUrl: "https://uni.example/grant", applicationUrl: "https://uni.example/apply", algeriaEligibility: "CONFIRMED",
  opportunityType: "SCHOLARSHIP", applicationStatus: "OPEN", directApplicationVerified: true,
};

describe("verification policy", () => {
  it("accepts a strict actionable Algeria scholarship", () => expect(evaluateVerification(valid).allowed).toBe(true));
  it("rejects generic international eligibility", () => expect(evaluateVerification({ ...valid, algeriaEligibility: "UNKNOWN" }).allowed).toBe(false));
  it("rejects invitations and details-only links", () => expect(evaluateVerification({ ...valid, opportunityType: "INVITATION", directApplicationVerified: false }).allowed).toBe(false));
  it("flags unsupported cross-host application links", () => expect(evaluateVerification({ ...valid, evidenceFields: ["title", "eligibility"], applicationUrl: "https://evil.example/apply" }).allowed).toBe(false));
});
