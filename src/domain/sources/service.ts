import { z } from "zod";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { enqueueCrawl } from "@/lib/queue";
import { assertPublicUrl, canonicalizeUrl } from "@/domain/crawler/url-policy";

export const createSourceSchema = z.object({
  providerName: z.string().trim().min(2).max(200),
  homepage: z.string().url(),
  scholarshipUrl: z.string().url(),
  hostCountry: z.string().trim().max(100).nullable().optional(),
  languages: z.array(z.string().trim().min(2).max(10)).max(20).default([]),
  category: z.enum(["UNIVERSITY", "GOVERNMENT", "PROGRAM", "PORTAL", "NGO", "OTHER"]).default("OTHER"),
  trustLevel: z.enum(["UNVERIFIED", "TRUSTED", "OFFICIAL"]).default("UNVERIFIED"),
  priority: z.number().int().min(0).max(100).default(50),
  notes: z.string().max(2000).nullable().optional(),
  startCrawl: z.boolean().default(true),
});

export async function createSourceAndCrawl(input: z.infer<typeof createSourceSchema>) {
  const canonicalUrl = canonicalizeUrl(input.scholarshipUrl);
  await assertPublicUrl(canonicalUrl);
  const result = await db.$transaction(async (tx) => {
    const { startCrawl, ...sourceInput } = input;
    const source = await tx.source.create({ data: { ...sourceInput, canonicalUrl } });
    if (!input.startCrawl) return { source, crawlJob: null };
    const crawlJob = await tx.crawlJob.create({ data: { sourceId: source.id, rootUrl: canonicalUrl, maxDepth: config.CRAWLER_MAX_DEPTH, pageLimit: config.CRAWLER_DEFAULT_DOMAIN_PAGE_LIMIT } });
    await tx.crawlFrontier.create({ data: { crawlJobId: crawlJob.id, url: canonicalUrl, canonicalUrl, depth: 0 } });
    return { source, crawlJob };
  });
  if (result.crawlJob) await enqueueCrawl(result.crawlJob.id);
  return result;
}

export async function startSourceCrawl(sourceId: string) {
  const source = await db.source.findUnique({ where: { id: sourceId } });
  if (!source || !source.enabled) throw new Error("Enabled source not found");
  const active = await db.crawlJob.findFirst({ where: { sourceId, status: { in: ["QUEUED", "ACTIVE"] } } });
  if (active) return active;
  const crawlJob = await db.$transaction(async (tx) => {
    const job = await tx.crawlJob.create({ data: { sourceId, rootUrl: source.canonicalUrl, maxDepth: config.CRAWLER_MAX_DEPTH, pageLimit: config.CRAWLER_DEFAULT_DOMAIN_PAGE_LIMIT } });
    await tx.crawlFrontier.create({ data: { crawlJobId: job.id, url: source.canonicalUrl, canonicalUrl: source.canonicalUrl, depth: 0 } });
    return job;
  });
  await enqueueCrawl(crawlJob.id);
  return crawlJob;
}
