import { describe, expect, it } from "vitest";
import { isPotentialScholarshipResult } from "@/domain/search/serpapi";

describe("search result relevance filter", () => {
  it("accepts likely scholarship pages", () => expect(isPotentialScholarshipResult({ title: "Graduate Scholarship for Algerian Students", snippet: "Applications are open", canonicalUrl: "https://example.edu/apply" })).toBe(true));
  it("accepts French scholarship pages", () => expect(isPotentialScholarshipResult({ title: "Bourse de master", snippet: "Candidatures", canonicalUrl: "https://example.fr/bourse" })).toBe(true));
  it("rejects obvious non-scholarship invitations", () => expect(isPotentialScholarshipResult({ title: "International conference invitation", snippet: "Register for our webinar", canonicalUrl: "https://example.org/conference" })).toBe(false));
  it("does not accept a generic admissions page without funding language", () => expect(isPotentialScholarshipResult({ title: "Graduate admissions", snippet: "See available programmes", canonicalUrl: "https://example.edu/graduate" })).toBe(false));
});
