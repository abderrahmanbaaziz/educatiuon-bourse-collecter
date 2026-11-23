import { describe, expect, it } from "vitest";
import { assertPublicUrl, canonicalizeUrl, sameSite } from "@/domain/crawler/url-policy";

describe("URL policy", () => {
  it("canonicalizes URLs and removes tracking", () => {
    expect(canonicalizeUrl("HTTPS://Example.EDU:443/path/?utm_source=x&b=2&a=1#section")).toBe("https://example.edu/path?a=1&b=2");
  });
  it("resolves relative links", () => expect(canonicalizeUrl("../apply", "https://example.edu/scholarships/list")).toBe("https://example.edu/apply"));
  it("rejects private and metadata addresses", async () => {
    await expect(assertPublicUrl("http://127.0.0.1/admin")).rejects.toThrow(/Private network/);
    await expect(assertPublicUrl("http://169.254.169.254/latest/meta-data")).rejects.toThrow(/Private network/);
  });
  it("recognizes same host despite www", () => expect(sameSite("https://www.example.edu/a", "https://example.edu/b")).toBe(true));
});
