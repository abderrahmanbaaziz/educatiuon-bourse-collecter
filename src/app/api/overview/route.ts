import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function GET() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
  const [total, verified, discoveredToday, active, sources, pages, usage, recentJobs] = await Promise.all([
    db.scholarship.count(), db.scholarship.count({ where: { status: "VERIFIED" } }), db.scholarship.count({ where: { createdAt: { gte: today } } }),
    db.crawlJob.count({ where: { status: { in: ["QUEUED", "ACTIVE"] } } }), db.source.count({ where: { enabled: true } }), db.sourcePage.count(),
    db.aPIUsage.groupBy({ by: ["provider"], where: { createdAt: { gte: month } }, _sum: { requests: true, costUsd: true } }),
    db.crawlJob.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { source: { select: { providerName: true } } } }),
  ]);
  return NextResponse.json({ total, verified, discoveredToday, active, sources, pages, usage, recentJobs });
}
