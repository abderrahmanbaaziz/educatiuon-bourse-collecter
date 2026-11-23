import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "./config";

export const CRAWL_QUEUE = "crawl-investigations";
export const NOTIFICATION_QUEUE = "notification-deliveries";

const globalQueue = globalThis as unknown as { crawlRedis?: IORedis; crawlQueue?: Queue; notificationQueue?: Queue };
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

export async function pingRedis() {
  const redis = new IORedis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 3000 });
  try { await redis.connect(); return await redis.ping(); } finally { redis.disconnect(); }
}
