import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config, hasTelegramProvider } from "./config";

export const CRAWL_QUEUE = "crawl-investigations";
export const NOTIFICATION_QUEUE = "notification-deliveries";
export const AUTOMATION_QUEUE = "discovery-automation";

const globalQueue = globalThis as unknown as { crawlRedis?: IORedis; crawlQueue?: Queue; notificationQueue?: Queue; automationQueue?: Queue };
function getQueue() {
  if (!globalQueue.crawlRedis) globalQueue.crawlRedis = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });
  if (!globalQueue.crawlQueue) globalQueue.crawlQueue = new Queue(CRAWL_QUEUE, { connection: globalQueue.crawlRedis });
  return globalQueue.crawlQueue;
}

function getNotificationQueue() {
  if (!globalQueue.crawlRedis) globalQueue.crawlRedis = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });
  if (!globalQueue.notificationQueue) globalQueue.notificationQueue = new Queue(NOTIFICATION_QUEUE, { connection: globalQueue.crawlRedis });
  return globalQueue.notificationQueue;
}

export function getAutomationQueue() {
  if (!globalQueue.crawlRedis) globalQueue.crawlRedis = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });
  if (!globalQueue.automationQueue) globalQueue.automationQueue = new Queue(AUTOMATION_QUEUE, { connection: globalQueue.crawlRedis });
  return globalQueue.automationQueue;
}

export async function enqueueCrawl(crawlJobId: string) {
  return getQueue().add("crawl", { crawlJobId }, {
    jobId: crawlJobId,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 7 * 24 * 3600, count: 5000 },
    removeOnFail: false,
  });
}

export async function enqueueNotification(deliveryId: string) {
  return getNotificationQueue().add("deliver", { deliveryId }, {
    jobId: deliveryId, attempts: 5, backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { age: 30 * 24 * 3600, count: 10000 }, removeOnFail: false,
  });
}

export async function enqueueAutomation(name: string, data: Record<string, unknown> = {}) {
  return getAutomationQueue().add(name, data, {
    attempts: 2,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: { age: 30 * 24 * 3600, count: 5000 },
    removeOnFail: false,
  });
}

export async function registerAutomationSchedules() {
  const queue = getAutomationQueue();
  await queue.upsertJobScheduler("twice-daily-dork-discovery", { pattern: config.DISCOVERY_DORK_CRON, tz: config.AUTOMATION_TIMEZONE }, { name: "scheduled-discovery", data: {} });
  await queue.upsertJobScheduler("weekly-source-watch", { pattern: config.SOURCE_WATCH_CRON, tz: config.AUTOMATION_TIMEZONE }, { name: "weekly-watch", data: {} });
  if (hasTelegramProvider) await queue.upsertJobScheduler("telegram-command-poll", { every: 15_000 }, { name: "telegram-poll", data: {} });
}

export async function pingRedis() {
  const redis = new IORedis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 3000 });
  try { await redis.connect(); return await redis.ping(); } finally { redis.disconnect(); }
}
