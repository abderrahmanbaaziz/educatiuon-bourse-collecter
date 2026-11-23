import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthConfig } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import { checkLoginRateLimit, clearLoginRateLimit } from "@/lib/auth/rate-limit";
import { isSameOriginRequest, requestIp } from "@/lib/auth/request";
import { createSessionToken, safeRedirectPath, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

function constantTimeUsernameMatch(candidate: string, expected: string, secret: string): boolean {
  const left = createHmac("sha256", secret).update(candidate).digest();
  const right = createHmac("sha256", secret).update(expected).digest();
  return timingSafeEqual(left, right);
}

function errorResponse(request: Request, error: string, status: number, next: string, retryAfter?: number) {
  const acceptsJson = request.headers.get("accept")?.includes("application/json");
  const headers = retryAfter ? { "retry-after": String(retryAfter) } : undefined;
  if (acceptsJson) return NextResponse.json({ error }, { status, headers });
  const location = new URL("/login", request.url);
  location.searchParams.set("error", error);
  if (next !== "/") location.searchParams.set("next", next);
  return NextResponse.redirect(location, { status: 303, headers });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) return NextResponse.json({ error: "Request too large" }, { status: 413 });

  let username = "";
  let password = "";
  let next = "/";
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json() as Record<string, unknown>;
      username = typeof body.username === "string" ? body.username.trim() : "";
      password = typeof body.password === "string" ? body.password : "";
      next = safeRedirectPath(body.next);
    } else {
      const body = await request.formData();
      username = String(body.get("username") ?? "").trim();
      password = String(body.get("password") ?? "");
      next = safeRedirectPath(body.get("next"));
    }
  } catch {
    return errorResponse(request, "invalid_request", 400, "/");
  }

  if (username.length > 128 || password.length > 1_024) return errorResponse(request, "invalid_credentials", 401, next);

  let auth;
  try {
    auth = getAuthConfig();
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : "invalid auth configuration" }, "Authentication is not configured");
    return errorResponse(request, "unavailable", 503, next, 30);
  }

  const ip = requestIp(request.headers);
  const rateLimit = await checkLoginRateLimit(auth.REDIS_URL, ip, username, auth.AUTH_SESSION_SECRET);
  if (!rateLimit.allowed) {
    if (rateLimit.unavailable) logger.warn("Login denied because the rate limiter is unavailable");
    return errorResponse(request, rateLimit.unavailable ? "unavailable" : "rate_limited", rateLimit.unavailable ? 503 : 429, next, rateLimit.retryAfter);
  }

  let passwordMatches = false;
  try {
    passwordMatches = await verifyPassword(password, auth.ADMIN_PASSWORD_HASH);
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : "invalid password hash" }, "Authentication is not configured");
    return errorResponse(request, "unavailable", 503, next, 30);
  }
  const usernameMatches = constantTimeUsernameMatch(username, auth.ADMIN_USERNAME, auth.AUTH_SESSION_SECRET);
  if (!passwordMatches || !usernameMatches) return errorResponse(request, "invalid_credentials", 401, next);

  await clearLoginRateLimit(auth.REDIS_URL, ip, username, auth.AUTH_SESSION_SECRET);
  const token = await createSessionToken(auth.ADMIN_USERNAME, auth.AUTH_SESSION_SECRET, auth.AUTH_SESSION_TTL_SECONDS);
  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(auth.AUTH_SESSION_TTL_SECONDS));
  response.headers.set("cache-control", "no-store");
  return response;
}
