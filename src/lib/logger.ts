import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: ["req.headers.authorization", "apiKey", "key", "SERPAPI_KEY_PRIMARY", "AGENTROUTER_API_KEY"],
});
