import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { runSerpSearch } from "@/domain/search/serpapi";

export const dynamic = "force-dynamic";

export async function GET() {
  const runs = await db.searchRun.findMany({
    take: 50,
    orderBy: { executedAt: "desc" },
    include: {
      searchQuery: true,
      results: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        include: { crawlJob: { select: { status: true, scholarships: { select: { status: true } } } } },
      },
    },
  });

  return NextResponse.json(runs.map((run) => {
    const statusCounts: Record<string, number> = {};
    for (const result of run.results) for (const scholarship of result.crawlJob?.scholarships ?? []) {
      statusCounts[scholarship.status] = (statusCounts[scholarship.status] ?? 0) + 1;
    }
    const domains = new Map<string, { domain: string; results: number; queued: number; crawled: number; candidates: number; rejected: number }>();
    for (const result of run.results) {
      let domain = result.domain;
      if (!domain) try { domain = new URL(result.canonicalUrl).hostname.replace(/^www\./, ""); } catch { domain = "Unknown domain"; }
      const item = domains.get(domain) ?? { domain, results: 0, queued: 0, crawled: 0, candidates: 0, rejected: 0 };
      item.results++;
      if (result.crawlJobId) item.queued++;
      if (result.crawlJob?.status === "SUCCEEDED") item.crawled++;
      item.candidates += result.crawlJob?.scholarships.filter((scholarship) => ["NEEDS_REVIEW", "VERIFIED"].includes(scholarship.status)).length ?? 0;
      item.rejected += result.crawlJob?.scholarships.filter((scholarship) => scholarship.status === "REJECTED").length ?? 0;
      domains.set(domain, item);
    }
    return {
      id: run.id,
      query: run.searchQuery.query,
      language: run.searchQuery.language,
      account: run.account,
      status: run.status,
      error: run.error,
      executedAt: run.executedAt,
      trigger: run.trigger,
      requestLabel: run.requestLabel,
      trackingAvailable: run.resultCount === 0 || run.results.some((result) => Boolean(result.domain || result.crawlJobId)),
      resultCount: run.resultCount,
      newUrlCount: run.newUrlCount,
      uniqueDomainCount: run.uniqueDomainCount || domains.size,
      queuedUrlCount: run.queuedUrlCount,
      skippedUrlCount: run.skippedUrlCount,
      candidateCount: (statusCounts.NEEDS_REVIEW ?? 0) + (statusCounts.VERIFIED ?? 0),
      rejectedCount: statusCounts.REJECTED ?? 0,
      domains: [...domains.values()].sort((left, right) => right.candidates - left.candidates || right.results - left.results || left.domain.localeCompare(right.domain)),
    };
  }));
}

export async function POST(request: Request) {
  try {
    const input = z.object({ query: z.string().min(3).max(500), language: z.string().min(2).max(10).default("en"), confirmPaidRequest: z.literal(true) }).parse(await request.json());
    return NextResponse.json(await runSerpSearch(input.query, input.language, undefined, { trigger: "MANUAL", requestLabel: input.query }), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Search failed" }, { status: 400 });
  }
}
