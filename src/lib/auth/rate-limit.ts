import { createHmac } from "node:crypto";
import IORedis from "ioredis";

const WINDOW_SECONDS = 15 * 60;
const IP_LIMIT = 10;
const ACCOUNT_LIMIT = 20;

const globalAuthRedis = globalThis as unknown as { authRedis?: IORedis };

function getRedis(url: string): IORedis {
  if (!globalAuthRedis.authRedis || globalAuthRedis.authRedis.status === "end") {
    globalAuthRedis.authRedis = new IORedis(url, {
      lazyConnect: true,
      connectTimeout: 2_000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    globalAuthRedis.authRedis.on("error", () => undefined);
  }
  return globalAuthRedis.authRedis;
}

function digest(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function keys(ip: string, username: string, secret: string) {
  return [
    `auth:login:ip:${digest(ip, secret)}`,
    `auth:login:account:${digest(username.toLocaleLowerCase("en-US"), secret)}`,
  ];
}

export type LoginRateLimit = { allowed: boolean; retryAfter: number; unavailable?: boolean };

export async function checkLoginRateLimit(
  redisUrl: string,
  ip: string,
  username: string,
  secret: string,
): Promise<LoginRateLimit> {
  const redis = getRedis(redisUrl);
  try {
    if (redis.status === "wait") await redis.connect();
    const result = await redis.eval(
      `local ipCount = redis.call('INCR', KEYS[1])
       if ipCount == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
       local accountCount = redis.call('INCR', KEYS[2])
       if accountCount == 1 then redis.call('EXPIRE', KEYS[2], ARGV[1]) end
       local ipTtl = redis.call('TTL', KEYS[1])
       local accountTtl = redis.call('TTL', KEYS[2])
       return {ipCount, accountCount, math.max(ipTtl, accountTtl)}`,
      2,
      ...keys(ip, username, secret),
      WINDOW_SECONDS,
    ) as [number, number, number];
    return { allowed: result[0] <= IP_LIMIT && result[1] <= ACCOUNT_LIMIT, retryAfter: Math.max(1, result[2]) };
  } catch {
    return { allowed: false, retryAfter: 30, unavailable: true };
  }
}

export async function clearLoginRateLimit(redisUrl: string, ip: string, username: string, secret: string) {
  const redis = getRedis(redisUrl);
  try {
    if (redis.status === "wait") await redis.connect();
    await redis.del(...keys(ip, username, secret));
  } catch {
    // A successful login must not fail merely because cleanup is unavailable.
  }
}
