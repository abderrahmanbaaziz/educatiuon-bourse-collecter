import { describe, expect, it } from "vitest";
import { extractXml, isXmlDocument } from "@/domain/crawler/xml";

describe("XML discovery", () => {
  it("extracts and deduplicates sitemap URLs", () => {
    const page=extractXml(`<?xml version="1.0"?><urlset><url><loc>https://uni.example/scholarships/a</loc></url><url><loc>https://uni.example/scholarships/a#details</loc></url></urlset>`,"https://uni.example/sitemap.xml");
    expect(page.links).toHaveLength(1);expect(page.links[0].url).toBe("https://uni.example/scholarships/a");
  });
  it("extracts RSS and Atom entries",()=>{
    const rss=extractXml(`<rss><channel><title>Funding</title><item><title>Master grant</title><link>https://uni.example/grant</link><description>Applications open</description></item></channel></rss>`,"https://uni.example/rss");
    const atom=extractXml(`<feed><entry><title>PhD award</title><link rel="alternate" href="/phd"/></entry></feed>`,"https://uni.example/feed.xml");
    expect(rss.links[0].text).toBe("Master grant");expect(atom.links[0].url).toBe("https://uni.example/phd");
  });
  it("recognizes feed content types",()=>expect(isXmlDocument("application/atom+xml","https://uni.example/latest")).toBe(true));
});
