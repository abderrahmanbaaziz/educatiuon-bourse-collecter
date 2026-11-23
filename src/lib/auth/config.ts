import { z } from "zod";

const authEnvSchema = z.object({
  ADMIN_USERNAME: z.string().trim().min(1).max(128),
  ADMIN_PASSWORD_HASH: z.string().regex(/^scrypt\$\d+\$\d+\$\d+\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/),
  AUTH_SESSION_SECRET: z.string().min(32),
  AUTH_SESSION_TTL_SECONDS: z.coerce.number().int().min(300).max(604_800).default(43_200),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
});

export type AuthConfig = z.infer<typeof authEnvSchema>;

let cachedConfig: AuthConfig | undefined;

export function getAuthConfig(): AuthConfig {
  if (!cachedConfig) cachedConfig = authEnvSchema.parse(process.env);
  return cachedConfig;
}

export function resetAuthConfigForTests() {
  if (process.env.NODE_ENV !== "test") return;
  cachedConfig = undefined;
}
