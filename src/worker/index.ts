import { Worker } from "bullmq";
import IORedis from "ioredis";
import {
  CRAWL_QUEUE,
  AUTOMATION_QUEUE,
  NOTIFICATION_QUEUE,
  enqueueCrawl,
  enqueueNotification,
  registerAutomationSchedules,
} from "@/lib/queue";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import {
  processCrawlJob,
  recoverInterruptedCrawls,
} from "@/domain/crawler/process-job";
import { db } from "@/lib/db";
import { processNotificationDelivery } from "@/domain/notifications/process-delivery";
import { recoverPendingNotifications } from "@/domain/notifications/service";
import { processAutomationTask } from "@/domain/automation/service";
import { ensureTelegramWebhook } from "@/domain/notifications/telegram";

async function main() {
  const connection = new IORedis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  for (const job of await recoverInterruptedCrawls()) {
    try {
      await enqueueCrawl(job.id);
    } catch (error) {
      logger.warn(
        { jobId: job.id, error },
        "Could not requeue interrupted crawl",
      );
    }
  }
  for (const delivery of await recoverPendingNotifications()) {
    try {
      await enqueueNotification(delivery.id);
    } catch (error) {
      logger.warn(
        { deliveryId: delivery.id, error },
        "Could not requeue pending notification",
      );
    }
  }

  const worker = new Worker(
    CRAWL_QUEUE,
    async (bullJob) => processCrawlJob(bullJob.data.crawlJobId),
    {
      connection,
      concurrency: config.CRAWLER_GLOBAL_CONCURRENCY,
    },
  );
  const notificationConnection = new IORedis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
  const notificationWorker = new Worker(
    NOTIFICATION_QUEUE,
    async (bullJob) => processNotificationDelivery(bullJob.data.deliveryId),
    {
      connection: notificationConnection,
      concurrency: 1,
      limiter: { max: 20, duration: 1000 },
    },
  );
  await registerAutomationSchedules();
  await ensureTelegramWebhook().catch((error) => logger.warn({ error: error instanceof Error ? error.message : String(error) }, "Could not register Telegram webhook; it will retry after the next worker restart"));
  const automationConnection = new IORedis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
  const automationWorker = new Worker(
    AUTOMATION_QUEUE,
    async (bullJob) => processAutomationTask(bullJob.name, bullJob.data),
    {
      connection: automationConnection,
      concurrency: 1,
    },
  );

  worker.on("completed", (job) =>
    logger.info({ jobId: job.id }, "Crawl completed"),
  );
  worker.on("failed", (job, error) =>
    logger.error({ jobId: job?.id, error: error.message }, "Crawl failed"),
  );
  notificationWorker.on("completed", (job) =>
    logger.info({ jobId: job.id }, "Notification delivered"),
  );
  notificationWorker.on("failed", (job, error) =>
    logger.error(
      { jobId: job?.id, error: error.message },
      "Notification delivery failed",
    ),
  );
  automationWorker.on("completed", (job) =>
    logger.info({ jobId: job.id, task: job.name }, "Automation completed"),
  );
  automationWorker.on("failed", (job, error) =>
    logger.error({ jobId: job?.id, task: job?.name, error: error.message }, "Automation failed"),
  );
  logger.info(
    { concurrency: config.CRAWLER_GLOBAL_CONCURRENCY },
    "Crawler worker ready",
  );

  async function shutdown(signal: string) {
    logger.info({ signal }, "Stopping worker");
    await Promise.all([worker.close(), notificationWorker.close(), automationWorker.close()]);
    await Promise.all([connection.quit(), notificationConnection.quit(), automationConnection.quit()]);
    await db.$disconnect();
    process.exit(0);
  }
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch(async (error) => {
  logger.fatal({ error }, "Crawler worker failed to start");
  await db.$disconnect();
  process.exit(1);
});
