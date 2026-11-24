import { describe, expect, it } from "vitest";
import { evaluateAlgeriaGate } from "@/domain/scholarships/algeria-gate";
import type { ScholarshipExtraction } from "@/domain/ai/schemas";

const base: ScholarshipExtraction = {
  title: "Graduate Scholarship", provider: "Example University", institution: null, host_country: "France",
  opportunity_type: "SCHOLARSHIP", algeria_eligibility: "CONFIRMED", algeria_eligibility_reason: "Algeria is listed",
  application_status: "OPEN", application_link_type: "DIRECT_APPLY", eligible_nationalities: ["Algeria"], degree_levels: ["Master"], academic_fields: [],
  funding_category: "FULL", tuition_coverage: null, monthly_stipend: null, accommodation: null, travel_allowance: null, health_insurance: null,
  language_requirements: null, academic_requirements: null, age_restrictions: null, opening_date: null, deadline: "2028-01-01", academic_year: "2028",
  required_documents: [], application_process: "Submit the portal form", application_url: "https://example.edu/apply", publication_date: null, language: "en", confidence: 0.9,
  evidence: [{ field: "eligibility", value: "Algeria", evidence_text: "Applicants from Algeria are eligible" }, { field: "application_url", value: "https://example.edu/apply", evidence_text: "Apply now" }],
};

describe("Algeria actionability gate", () => {
  it("accepts an evidenced open scholarship with a real linked application portal", () => expect(evaluateAlgeriaGate(base, "https://example.edu/scholarship", [{ url: "https://example.edu/apply" }]).accepted).toBe(true));
  it("rejects generic international eligibility", () => expect(evaluateAlgeriaGate({ ...base, algeria_eligibility: "UNKNOWN", evidence: [{ field: "eligibility", value: "international", evidence_text: "Open to international students" }] }, "https://example.edu/scholarship", [{ url: "https://example.edu/apply" }]).accepted).toBe(false));
  it("rejects an invented or details-only application URL", () => expect(evaluateAlgeriaGate({ ...base, application_link_type: "DETAILS_ONLY" }, "https://example.edu/scholarship", []).directApplicationVerified).toBe(false));
});
