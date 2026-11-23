import { Worker } from "bullmq";
import IORedis from "ioredis";
import { CRAWL_QUEUE, NOTIFICATION_QUEUE, enqueueCrawl, enqueueNotification } from "@/lib/queue";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { processCrawlJob, recoverInterruptedCrawls } from "@/domain/crawler/process-job";
import { db } from "@/lib/db";
import { processNotificationDelivery } from "@/domain/notifications/process-delivery";
import { recoverPendingNotifications } from "@/domain/notifications/service";

const connection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });

for (const job of await recoverInterruptedCrawls()) {
  try { await enqueueCrawl(job.id); } catch (error) { logger.warn({ jobId: job.id, error }, "Could not requeue interrupted crawl"); }
}
for (const delivery of await recoverPendingNotifications()) {
  try { await enqueueNotification(delivery.id); } catch (error) { logger.warn({ deliveryId: delivery.id, error }, "Could not requeue pending notification"); }
}

const worker = new Worker(CRAWL_QUEUE, async (bullJob) => processCrawlJob(bullJob.data.crawlJobId), {
  connection, concurrency: config.CRAWLER_GLOBAL_CONCURRENCY,
});
const notificationConnection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });
const notificationWorker = new Worker(NOTIFICATION_QUEUE, async (bullJob) => processNotificationDelivery(bullJob.data.deliveryId), {
  connection: notificationConnection, concurrency: 1, limiter: { max: 20, duration: 1000 },
});

worker.on("completed", (job) => logger.info({ jobId: job.id }, "Crawl completed"));
worker.on("failed", (job, error) => logger.error({ jobId: job?.id, error: error.message }, "Crawl failed"));
notificationWorker.on("completed", (job) => logger.info({ jobId: job.id }, "Notification delivered"));
notificationWorker.on("failed", (job, error) => logger.error({ jobId: job?.id, error: error.message }, "Notification delivery failed"));
logger.info({ concurrency: config.CRAWLER_GLOBAL_CONCURRENCY }, "Crawler worker ready");

async function shutdown(signal: string) {
  logger.info({ signal }, "Stopping worker");
  await Promise.all([worker.close(), notificationWorker.close()]); await Promise.all([connection.quit(), notificationConnection.quit()]); await db.$disconnect(); process.exit(0);
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
