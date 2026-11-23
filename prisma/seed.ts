import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaults = [
  ["discovery.paused", false, "Global paid discovery pause switch"],
  ["crawler.maxDepth", Number(process.env.CRAWLER_MAX_DEPTH ?? 4), "Default crawl depth"],
  ["crawler.pageLimit", Number(process.env.CRAWLER_DEFAULT_DOMAIN_PAGE_LIMIT ?? 100), "Default pages per crawl"],
  ["budget.aiMonthlyUsd", Number(process.env.AI_MONTHLY_BUDGET_USD ?? 30), "Monthly AI spend ceiling"],
  ["budget.serpApiMonthly", Number(process.env.SERPAPI_MONTHLY_BUDGET ?? 6000), "Monthly search request ceiling"],
  ["notifications.telegram.enabled", false, "Master switch for Telegram deliveries"],
  ["notifications.telegram.verifiedScholarships", true, "Announce scholarships after human verification"],
  ["notifications.telegram.crawlFailures", false, "Send crawler failure alerts"],
] as const;

for (const [key, value, description] of defaults) {
  await prisma.systemSetting.upsert({ where: { key }, update: {}, create: { key, value, description } });
}

await prisma.$disconnect();
