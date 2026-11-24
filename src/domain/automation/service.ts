import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { config, hasSearchProvider, hasTelegramProvider } from "@/lib/config";
import { enqueueAutomation } from "@/lib/queue";
import { buildTargetedDorks, generateDomainDorks, rotateDorks } from "@/domain/discovery/dorks";
import { runSerpSearch } from "@/domain/search/serpapi";
import { startSourceCrawl } from "@/domain/sources/service";
import { escapeTelegramHtml, getTelegramUpdates, sendTelegramMessage } from "@/domain/notifications/telegram";

const taskSchema = z.discriminatedUnion("name", [
  z.object({ name: z.literal("scheduled-discovery"), data: z.record(z.string(), z.unknown()).default({}) }),
  z.object({ name: z.literal("weekly-watch"), data: z.record(z.string(), z.unknown()).default({}) }),
  z.object({ name: z.literal("telegram-poll"), data: z.record(z.string(), z.unknown()).default({}) }),
  z.object({ name: z.literal("telegram-discovery"), data: z.object({ request: z.string().min(3).max(120) }) }),
]);

async function settingValue<T>(key: string, fallback: T): Promise<T> {
  const setting = await db.systemSetting.findUnique({ where: { key } });
  return (setting?.value as T | undefined) ?? fallback;
}

async function putSetting(key: string, value: Prisma.InputJsonValue, description?: string) {
  return db.systemSetting.upsert({ where: { key }, update: { value }, create: { key, value, description } });
}

export async function runScheduledDiscovery() {
  if (!hasSearchProvider) return { skipped: true, reason: "No SerpAPI account is configured" };
  if (await settingValue("discovery.paused", false)) return { skipped: true, reason: "Discovery is paused" };
  const sources = await db.source.findMany({
    where: { enabled: true },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    select: { id: true, providerName: true, scholarshipUrl: true, priority: true, languages: true },
  });
  const pool = generateDomainDorks(sources);
  const cursor = await settingValue("automation.dorkCursor", 0);
  const { selected, nextCursor } = rotateDorks(pool, Number(cursor) || 0, config.DISCOVERY_DORKS_PER_RUN);
  await putSetting("automation.dorkCursor", nextCursor, "Round-robin cursor for scheduled domain dorks");
  const results: Array<{ query: string; ok: boolean; result?: unknown; error?: string }> = [];
  for (const dork of selected) {
    try {
      results.push({ query: dork.query, ok: true, result: await runSerpSearch(dork.query, dork.language, dork.sourceId) });
    } catch (error) {
      results.push({ query: dork.query, ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { skipped: false, domainCount: pool.length, executed: selected.length, succeeded: results.filter((item) => item.ok).length, failed: results.filter((item) => !item.ok).length, results };
}

export async function runWeeklySourceWatch() {
  const sources = await db.source.findMany({ where: { enabled: true }, orderBy: [{ priority: "desc" }, { createdAt: "asc" }], select: { id: true } });
  let queued = 0;
  let alreadyActive = 0;
  const failed: string[] = [];
  for (const source of sources) {
    try {
      const activeBefore = await db.crawlJob.findFirst({ where: { sourceId: source.id, status: { in: ["QUEUED", "ACTIVE"] } }, select: { id: true } });
      await startSourceCrawl(source.id);
      if (activeBefore) alreadyActive++; else queued++;
    } catch (error) {
      failed.push(error instanceof Error ? error.message : String(error));
    }
  }
  return { sources: sources.length, queued, alreadyActive, failed: failed.length };
}

export async function runTargetedTelegramDiscovery(request: string) {
  if (!hasSearchProvider) throw new Error("No SerpAPI account is configured");
  const queries = buildTargetedDorks(request);
  let found = 0;
  let newUrls = 0;
  let failed = 0;
  for (const query of queries) {
    try {
      const result = await runSerpSearch(query, "en");
      found += result.resultCount;
      newUrls += result.newUrlCount;
    } catch { failed++; }
  }
  await sendTelegramMessage([
    "<b>Targeted discovery finished</b>",
    `Request: ${escapeTelegramHtml(request)}`,
    `Queries: ${queries.length - failed}/${queries.length} succeeded`,
    `Results: ${found}`,
    `New URLs queued: ${newUrls}`,
    "New scholarship candidates will be sent after extraction.",
  ].join("\n"));
  return { request, queries: queries.length, failed, found, newUrls };
}

export async function pollTelegramCommands() {
  if (!hasTelegramProvider) return { skipped: true };
  let offset = Number(await settingValue("telegram.updateOffset", 0)) || 0;
  const updates = await getTelegramUpdates(offset);
  let accepted = 0;
  for (const update of updates) {
    offset = Math.max(offset, update.update_id + 1);
    const message = update.message;
    if (!message?.text || String(message.chat.id) !== config.TELEGRAM_CHAT_ID) continue;
    const command = message.text.trim();
    if (/^\/(start|help)(?:@\w+)?$/i.test(command)) {
      await sendTelegramMessage("<b>Bourse Collector commands</b>\n/discover computer science master\n/search renewable energy phd\n\nEach request runs up to three paid searches. Scheduled discovery runs twice daily.");
      continue;
    }
    const match = command.match(/^\/(?:discover|search)(?:@\w+)?\s+(.{3,120})$/i);
    if (!match) continue;
    const lastAt = Date.parse(String(await settingValue("telegram.lastDiscoveryAt", "1970-01-01T00:00:00.000Z")));
    const remaining = config.TELEGRAM_DISCOVERY_COOLDOWN_SECONDS * 1000 - (Date.now() - lastAt);
    if (remaining > 0) {
      await sendTelegramMessage(`Please wait ${Math.ceil(remaining / 1000)} seconds before another discovery request.`);
      continue;
    }
    const request = match[1].replace(/\s+/g, " ").trim();
    await putSetting("telegram.lastDiscoveryAt", new Date().toISOString(), "Last accepted Telegram discovery command");
    await enqueueAutomation("telegram-discovery", { request });
    await sendTelegramMessage(`Discovery queued for: <b>${escapeTelegramHtml(request)}</b>`);
    accepted++;
  }
  await putSetting("telegram.updateOffset", offset, "Last consumed Telegram update offset");
  return { skipped: false, received: updates.length, accepted, offset };
}

export async function processAutomationTask(name: string, data: unknown) {
  const task = taskSchema.parse({ name, data: data ?? {} });
  if (task.name === "scheduled-discovery") return runScheduledDiscovery();
  if (task.name === "weekly-watch") return runWeeklySourceWatch();
  if (task.name === "telegram-poll") return pollTelegramCommands();
  return runTargetedTelegramDiscovery(task.data.request);
}
