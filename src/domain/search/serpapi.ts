import { z } from "zod";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { assertPublicUrl, canonicalizeUrl } from "@/domain/crawler/url-policy";
import { enqueueCrawl } from "@/lib/queue";
import { sameSite } from "@/domain/crawler/url-policy";

const responseSchema = z.object({
  search_metadata: z.object({ status: z.string().optional() }).passthrough().optional(),
  error: z.string().optional(),
  organic_results: z.array(z.object({ position: z.number().optional(), title: z.string().optional(), link: z.string().url(), snippet: z.string().optional() })).default([]),
});

const accounts = [
  { name: "primary", key: config.SERPAPI_KEY_PRIMARY, allocation: 5000 },
  { name: "secondary", key: config.SERPAPI_KEY_SECONDARY, allocation: 1000 },
].filter((item): item is { name: string; key: string; allocation: number } => Boolean(item.key));

function billingMonth() { return new Date().toISOString().slice(0, 7); }

async function selectAccount() {
  if (!accounts.length) throw new Error("No SerpAPI account is configured");
  const usage = await db.aPIUsage.groupBy({ by: ["account"], where: { provider: "serpapi", billingMonth: billingMonth() }, _sum: { requests: true } });
  const used = new Map(usage.map((row) => [row.account, row._sum.requests ?? 0]));
  const available = accounts.map((account) => ({ ...account, remaining: account.allocation - (used.get(account.name) ?? 0) })).filter((account) => account.remaining > 0).sort((a, b) => b.remaining - a.remaining);
  if (!available.length) throw new Error("All configured SerpAPI account allocations are exhausted");
  return available[0];
}

export async function runSerpSearch(query: string, language = "en", sourceId?: string) {
  const paused = await db.systemSetting.findUnique({ where: { key: "discovery.paused" } });
  if (paused?.value === true) throw new Error("Discovery is paused");
  const total = await db.aPIUsage.aggregate({ where: { provider: "serpapi", billingMonth: billingMonth() }, _sum: { requests: true } });
  if ((total._sum.requests ?? 0) >= config.SERPAPI_MONTHLY_BUDGET) throw new Error("Monthly SerpAPI budget is exhausted");
  const account = await selectAccount();
  const searchQuery = await db.searchQuery.upsert({ where: { query_language: { query, language } }, update: {}, create: { query, language } });
  const run = await db.searchRun.create({ data: { searchQueryId: searchQuery.id, account: account.name, status: "RUNNING" } });
  try {
    const params = new URLSearchParams({ engine: "google", q: query, hl: language, num: "100", api_key: account.key, output: "json" });
    const response = await fetch(`https://serpapi.com/search?${params}`, { signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`SerpAPI returned HTTP ${response.status}`);
    const payload = responseSchema.parse(await response.json());
    if (payload.error) throw new Error(payload.error);
    const normalized = payload.organic_results.flatMap((result) => { try { return [{ ...result, canonicalUrl: canonicalizeUrl(result.link) }]; } catch { return []; } });
    let newUrls = 0;
    await db.$transaction(async (tx) => {
      for (const result of normalized) {
        await tx.searchResult.create({ data: { searchRunId: run.id, url: result.link, canonicalUrl: result.canonicalUrl, title: result.title, snippet: result.snippet, position: result.position } });
        const existed = await tx.searchResult.count({ where: { canonicalUrl: result.canonicalUrl, NOT: { searchRunId: run.id } } });
        if (!existed) newUrls++;
      }
      await tx.searchRun.update({ where: { id: run.id }, data: { status: "SUCCEEDED", resultCount: normalized.length, newUrlCount: newUrls } });
      await tx.aPIUsage.create({ data: { provider: "serpapi", account: account.name, operation: "google_search", billingMonth: billingMonth() } });
    });
    const source = sourceId ? await db.source.findUnique({ where: { id: sourceId }, select: { id: true, scholarshipUrl: true, enabled: true } }) : null;
    const knownSources = await db.source.findMany({ select: { id: true, scholarshipUrl: true, enabled: true } });
    for (const result of normalized.slice(0, config.DISCOVERY_RESULTS_PER_QUERY)) {
      const existing = await db.crawlJob.findFirst({ where: { rootUrl: result.canonicalUrl, status: { in: ["QUEUED", "ACTIVE", "SUCCEEDED"] } } });
      if (existing) continue;
      let linked = source && sameSite(source.scholarshipUrl, result.canonicalUrl) ? source : knownSources.find((item) => sameSite(item.scholarshipUrl, result.canonicalUrl));
      if (linked?.enabled === false) continue;
      if (!linked) {
        try {
          const safe = await assertPublicUrl(result.canonicalUrl);
          const created = await db.source.create({ data: {
            providerName: (result.title?.trim() || safe.hostname).slice(0, 200),
            homepage: safe.origin,
            scholarshipUrl: result.canonicalUrl,
            canonicalUrl: result.canonicalUrl,
            category: "OTHER",
            trustLevel: "UNVERIFIED",
            priority: 40,
            notes: "Automatically discovered by an Algeria-focused scheduled search.",
          }, select: { id: true, scholarshipUrl: true, enabled: true } });
          knownSources.push(created); linked = created;
        } catch {
          linked = knownSources.find((item) => sameSite(item.scholarshipUrl, result.canonicalUrl));
        }
      }
      if (!linked?.enabled) continue;
      const crawl = await db.crawlJob.create({ data: { sourceId: linked.id, rootUrl: result.canonicalUrl, maxDepth: config.CRAWLER_MAX_DEPTH, pageLimit: config.CRAWLER_DEFAULT_DOMAIN_PAGE_LIMIT, frontier: { create: { url: result.canonicalUrl, canonicalUrl: result.canonicalUrl, depth: 0 } } } });
      await enqueueCrawl(crawl.id);
    }
    return { id: run.id, account: account.name, resultCount: normalized.length, newUrlCount: newUrls };
  } catch (error) {
    await db.searchRun.update({ where: { id: run.id }, data: { status: "FAILED", error: error instanceof Error ? error.message : String(error) } });
    await db.aPIUsage.create({ data: { provider: "serpapi", account: account.name, operation: "google_search_failed", billingMonth: billingMonth() } });
    throw error;
  }
}

export function defaultScholarshipQueries(year = new Date().getUTCFullYear() + 1) {
  return [
    `international scholarships master ${year} application deadline`, `"Erasmus Mundus" applications ${year}`,
    `"bourse master" candidature ${year}`, `منح دراسية ممولة ${year}`, `site:edu international scholarship ${year}`,
    `site:ac.uk international scholarships ${year}`, `filetype:pdf scholarship application ${year}`,
  ];
}
