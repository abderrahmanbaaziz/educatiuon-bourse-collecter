import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { canonicalizeUrl } from "./url-policy";

export type ExtractedLink = { id: string; url: string; text: string; context: string };
export type ExtractedPage = { title: string; language: string | null; content: string; contentHash: string; links: ExtractedLink[] };

export function extractHtml(html: string, pageUrl: string): ExtractedPage {
  const $ = cheerio.load(html);
  $("script,style,noscript,svg,canvas,template,nav,footer").remove();
  const title = $("title").first().text().trim() || $("h1").first().text().trim() || new URL(pageUrl).hostname;
  const language = $("html").attr("lang")?.split("-")[0]?.toLowerCase() ?? null;
  const content = $("main,article,[role=main]").first().text().replace(/\s+/g, " ").trim() || $("body").text().replace(/\s+/g, " ").trim();
  const seen = new Set<string>();
  const links: ExtractedLink[] = [];
  $("a[href]").each((_, node) => {
    try {
      const url = canonicalizeUrl($(node).attr("href")!, pageUrl);
      if (seen.has(url)) return;
      seen.add(url);
      const text = $(node).text().replace(/\s+/g, " ").trim().slice(0, 300);
      const context = $(node).parent().text().replace(/\s+/g, " ").trim().slice(0, 500);
      links.push({ id: `link_${links.length + 1}`, url, text, context });
    } catch { /* Ignore mailto, javascript, malformed, and unsupported links. */ }
  });
  return { title, language, content, contentHash: createHash("sha256").update(content).digest("hex"), links };
}

const relevanceTerms = /scholar|bourse|funding|financial aid|grant|fellowship|erasmus|application|eligib|deadline|stipend|tuition/i;
export function rankRelevantLinks(links: ExtractedLink[], limit: number): ExtractedLink[] {
  return links
    .map((link) => ({ link, score: (link.text.match(relevanceTerms) ? 3 : 0) + (link.context.match(relevanceTerms) ? 2 : 0) + (link.url.match(relevanceTerms) ? 1 : 0) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ link }) => link);
}
