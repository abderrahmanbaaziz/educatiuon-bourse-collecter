import { describe, expect, it } from "vitest";
import { needsBrowserInspection, needsBrowserRendering } from "@/domain/crawler/render-page";

describe("browser escalation", () => {
  it("escalates empty application shells", () => expect(needsBrowserRendering(`<div id="root"></div>${"<script></script>".repeat(6)}`, "")).toBe(true));
  it("keeps readable pages lightweight", () => expect(needsBrowserRendering("<main>content</main>", "a".repeat(400))).toBe(false));
  it("inspects scholarship pages whose apply controls may be injected by JavaScript", () => expect(needsBrowserInspection("<script>loadForm()</script>", "Scholarship funding for students", [])).toBe(true));
  it("does not re-render when an apply link is already visible", () => expect(needsBrowserInspection("<script></script>", "Scholarship funding for students", [{ text: "Apply now", url: "https://example.edu/apply" }])).toBe(false));
});
