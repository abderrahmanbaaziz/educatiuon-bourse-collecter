import { describe, expect, it } from "vitest";
import { buildTargetedDorks, generateDomainDorks, rotateDorks } from "@/domain/discovery/dorks";

describe("discovery dorks", () => {
  it("deduplicates source URLs by domain and keeps the highest priority representative", () => {
    const dorks = generateDomainDorks([
      { id: "low", providerName: "Low", scholarshipUrl: "https://example.edu/news", priority: 20, languages: [] },
      { id: "high", providerName: "High", scholarshipUrl: "https://www.example.edu/scholarships", priority: 90, languages: ["fr"] },
    ], 2028);
    expect(dorks).toHaveLength(1);
    expect(dorks[0]).toMatchObject({ sourceId: "high", domain: "example.edu", language: "fr", priority: 90 });
    expect(dorks[0].query).toContain("site:example.edu");
  });

  it("rotates through the domain pool without exceeding the limit", () => {
    expect(rotateDorks(["a", "b", "c"], 2, 2)).toEqual({ selected: ["c", "a"], nextCursor: 1 });
  });

  it("builds bounded targeted dorks from a Telegram request", () => {
    const queries = buildTargetedDorks("computer science master", 2028);
    expect(queries).toHaveLength(3);
    expect(queries.every((query) => query.includes("computer science master"))).toBe(true);
  });
});
