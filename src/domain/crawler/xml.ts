import { XMLParser } from "fast-xml-parser";
import { canonicalizeUrl } from "./url-policy";
import type { ExtractedLink, ExtractedPage } from "./extract";
import { createHash } from "node:crypto";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });

function array<T>(value: T | T[] | undefined): T[] { return value === undefined ? [] : Array.isArray(value) ? value : [value]; }
function text(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "#text" in value) return String((value as { "#text": unknown })["#text"]);
  return null;
}

export function extractXml(xml: string, pageUrl: string): ExtractedPage {
  const document = parser.parse(xml) as Record<string, any>;
  const candidates: Array<{ url: string; title?: string; context?: string }> = [];
  for (const item of array(document.urlset?.url)) {
    const url = text(item?.loc); if (url) candidates.push({ url, title: "Sitemap URL", context: text(item?.lastmod) ?? "" });
  }
  for (const sitemap of array(document.sitemapindex?.sitemap)) {
    const url = text(sitemap?.loc); if (url) candidates.push({ url, title: "Nested sitemap", context: text(sitemap?.lastmod) ?? "" });
  }
  const channel = document.rss?.channel;
  for (const item of array(channel?.item)) {
    const url = text(item?.link); if (url) candidates.push({ url, title: text(item?.title) ?? "RSS item", context: text(item?.description) ?? "" });
  }
  for (const entry of array(document.feed?.entry)) {
    const rawLink = array(entry?.link).find((link: any) => link?.["@_rel"] === "alternate") ?? array(entry?.link)[0];
    const url = typeof rawLink === "string" ? rawLink : rawLink?.["@_href"];
    if (url) candidates.push({ url, title: text(entry?.title) ?? "Atom entry", context: text(entry?.summary) ?? "" });
  }
  const seen = new Set<string>(); const links: ExtractedLink[] = [];
  for (const candidate of candidates) try {
    const url = canonicalizeUrl(candidate.url, pageUrl); if (seen.has(url)) continue; seen.add(url);
    links.push({ id: `link_${links.length + 1}`, url, text: candidate.title ?? "Feed item", context: (candidate.context ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500) });
  } catch { /* malformed or unsupported feed URL */ }
  const content = links.map((link) => `${link.text} ${link.context}`).join(" ").trim();
  return { title: channel?.title ? String(channel.title) : document.feed?.title ? String(document.feed.title) : "XML discovery feed", language: channel?.language ? String(channel.language).split("-")[0] : null, content, contentHash: createHash("sha256").update(xml).digest("hex"), links };
}

export function isXmlDocument(contentType: string, url: string) {
  return /(?:application|text)\/(?:rss\+xml|atom\+xml|xml)/i.test(contentType) || /(?:sitemap|feed|rss|atom)[^/]*\.xml$|\/feed\/?$|\/rss\/?$/i.test(new URL(url).pathname);
}
