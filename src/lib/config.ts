import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://bourse:bourse@localhost:5432/bourse?schema=public"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  SERPAPI_KEY_PRIMARY: z.string().optional(),
  SERPAPI_KEY_SECONDARY: z.string().optional(),
  AGENTROUTER_API_KEY: z.preprocess((value) => typeof value === "string" ? value.replace(/^=/, "") : value, z.string().optional()),
  AGENTROUTER_BASE_URL: optionalUrl,
  AGENTROUTER_MODEL: z.string().default("openai/gpt-5.6-sol"),
  CRAWLER_MAX_DEPTH: z.coerce.number().int().min(0).max(10).default(4),
  CRAWLER_DEFAULT_DOMAIN_PAGE_LIMIT: z.coerce.number().int().min(1).max(1000).default(100),
  CRAWLER_GLOBAL_CONCURRENCY: z.coerce.number().int().min(1).max(50).default(5),
  CRAWLER_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
  CRAWLER_MAX_CONTENT_BYTES: z.coerce.number().int().min(1024).max(25_000_000).default(5_242_880),
  CRAWLER_MAX_CHILD_URLS: z.coerce.number().int().min(1).max(100).default(20),
  CRAWLER_BROWSER_ENABLED: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  AI_MONTHLY_BUDGET_USD: z.coerce.number().min(0).default(30),
  SERPAPI_MONTHLY_BUDGET: z.coerce.number().int().min(0).default(6000),
  DISCOVERY_DORK_CRON: z.string().min(5).default("0 7,19 * * *"),
  SOURCE_WATCH_CRON: z.string().min(5).default("0 3 * * 0"),
  AUTOMATION_TIMEZONE: z.string().min(1).default("Africa/Lagos"),
  DISCOVERY_DORKS_PER_RUN: z.coerce.number().int().min(1).max(100).default(6),
  TELEGRAM_DISCOVERY_COOLDOWN_SECONDS: z.coerce.number().int().min(10).max(86400).default(300),
  TELEGRAM_BOT_TOKEN: z.preprocess((value) => value === "" ? undefined : value, z.string().min(20).optional()),
  TELEGRAM_CHAT_ID: z.preprocess((value) => value === "" ? undefined : value, z.string().min(1).optional()),
  TELEGRAM_WEBHOOK_SECRET: z.preprocess((value) => value === "" ? undefined : value, z.string().regex(/^[A-Za-z0-9_-]{32,256}$/).optional()),
  TELEGRAM_MESSAGE_THREAD_ID: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().int().positive().optional()),
});

const aliases = {
  ...process.env,
  SERPAPI_KEY_PRIMARY: process.env.SERPAPI_KEY_PRIMARY || process.env.serp_api_5k,
  SERPAPI_KEY_SECONDARY: process.env.SERPAPI_KEY_SECONDARY || process.env.serp_api_1k,
  DATABASE_URL: process.env.DATABASE_URL,
};

export const config = envSchema.parse(aliases);
export const hasAIProvider = Boolean(config.AGENTROUTER_API_KEY && config.AGENTROUTER_BASE_URL);
export const hasSearchProvider = Boolean(config.SERPAPI_KEY_PRIMARY || config.SERPAPI_KEY_SECONDARY);
export const hasTelegramProvider = Boolean(config.TELEGRAM_BOT_TOKEN && config.TELEGRAM_CHAT_ID);
export const hasTelegramWebhook = Boolean(hasTelegramProvider && config.TELEGRAM_WEBHOOK_SECRET);
