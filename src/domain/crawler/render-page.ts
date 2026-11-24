import { chromium } from "playwright";
import { config } from "@/lib/config";
import { assertPublicUrl, canonicalizeUrl } from "./url-policy";

const USER_AGENT = "BourseCollector/0.1 (+scholarship-research; JavaScript fallback)";

export function needsBrowserRendering(html: string, readableText: string) {
  if (readableText.length >= 350) return false;
  return /<noscript[^>]*>.*(?:enable|requires?)\s+javascript/is.test(html)
    || /id=["'](?:__next|app|root)["'][^>]*>\s*<\/div>/i.test(html)
    || ((html.match(/<script\b/gi)?.length ?? 0) >= 5 && readableText.length < 200);
}

export function needsBrowserInspection(html: string, readableText: string, links: Array<{ text: string; url: string }>) {
  if (needsBrowserRendering(html, readableText)) return true;
  const scholarshipPage = /scholar|bourse|fellowship|grant|funding|منح/i.test(`${readableText} ${html}`);
  const hasApplyLink = links.some((link) => /apply|application|candidature|postuler|register|portal|التقديم|التسجيل/i.test(`${link.text} ${link.url}`));
  return scholarshipPage && !hasApplyLink && (/<form\b/i.test(html) || /<script\b/i.test(html));
}

export async function renderPublicPage(input: string) {
  const target = await assertPublicUrl(input);
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ userAgent: USER_AGENT, javaScriptEnabled: true });
    const page = await context.newPage();
    await page.route("**/*", async (route) => {
      const requestUrl = route.request().url();
      try {
        const parsed = new URL(requestUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) return route.abort("blockedbyclient");
        await assertPublicUrl(requestUrl);
        const type = route.request().resourceType();
        if (["image", "media", "font"].includes(type)) return route.abort("blockedbyclient");
        return route.continue();
      } catch { return route.abort("blockedbyclient"); }
    });
    const response = await page.goto(target.toString(), { waitUntil: "domcontentloaded", timeout: config.CRAWLER_REQUEST_TIMEOUT_MS });
    await page.waitForLoadState("networkidle", { timeout: Math.min(10_000, config.CRAWLER_REQUEST_TIMEOUT_MS) }).catch(() => undefined);
    const finalUrl = canonicalizeUrl(page.url()); await assertPublicUrl(finalUrl);
    const html = await page.content();
    if (Buffer.byteLength(html) > config.CRAWLER_MAX_CONTENT_BYTES) throw new Error("Rendered page exceeds content limit");
    return { url: finalUrl, status: response?.status() ?? 200, html };
  } finally { await browser.close(); }
}
