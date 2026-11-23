import { describe, expect, it } from "vitest";
import { aiDecisionSchema, scholarshipExtractionSchema, validateSelectedLinks } from "@/domain/ai/schemas";

describe("AI output validation", () => {
  it("rejects malformed decision JSON", () => expect(() => aiDecisionSchema.parse({ actions: "crawl everything" })).toThrow());
  it("rejects hallucinated link IDs", () => {
    const decision = aiDecisionSchema.parse({ actions: [{ type: "FOLLOW_LINKS", link_ids: ["link_999"], reason: "details" }], is_scholarship_related: true, investigation_complete: false, confidence: .8 });
    expect(() => validateSelectedLinks(decision, new Set(["link_1"]))).toThrow(/unknown link ID/);
  });
  it("requires explicit funding classification", () => expect(() => scholarshipExtractionSchema.parse({ title: "Test" })).toThrow());
});
