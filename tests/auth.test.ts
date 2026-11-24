import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  safeRedirectPath,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth/session";
import { isPublicPath } from "@/proxy";

describe("administrator password verification", () => {
  it("accepts only the password used to create a scrypt hash", async () => {
    const encoded = await hashPassword("a-strong-test-password", randomBytes(16));
    await expect(verifyPassword("a-strong-test-password", encoded)).resolves.toBe(true);
    await expect(verifyPassword("not-the-password", encoded)).resolves.toBe(false);
  });

  it("rejects malformed or deliberately weak hashes", async () => {
    await expect(verifyPassword("password", "scrypt$2$1$1$YQ$Yg")).rejects.toThrow();
  });
});

describe("administrator sessions", () => {
  const secret = "test-secret-that-is-at-least-thirty-two-characters-long";

  it("signs, verifies, and expires a session", async () => {
    const token = await createSessionToken("admin", secret, 900, 10_000);
    await expect(verifySessionToken(token, secret, "admin", 10_100)).resolves.toMatchObject({ sub: "admin", exp: 10_900 });
    await expect(verifySessionToken(token, secret, "admin", 10_900)).resolves.toBeNull();
  });

  it("rejects tampering and a session issued for another administrator", async () => {
    const token = await createSessionToken("admin", secret, 900, 10_000);
    const [payload, signature] = token.split(".");
    await expect(verifySessionToken(`${payload}x.${signature}`, secret, "admin", 10_100)).resolves.toBeNull();
    await expect(verifySessionToken(token, secret, "someone-else", 10_100)).resolves.toBeNull();
  });

  it("uses a host-only hardened cookie", () => {
    expect(SESSION_COOKIE_NAME).toMatch(/^__Host-/);
    expect(sessionCookieOptions(900)).toEqual({ httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 900 });
  });
});

describe("authentication routing", () => {
  it("allows only login, auth handlers, health, the secret-validated webhook, and static assets without a session", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/api/auth/login")).toBe(true);
    expect(isPublicPath("/api/health")).toBe(true);
    expect(isPublicPath("/api/telegram/webhook")).toBe(true);
    expect(isPublicPath("/_next/static/app.js")).toBe(true);
    expect(isPublicPath("/brand/logo.png")).toBe(true);
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/api/scholarships")).toBe(false);
    expect(isPublicPath("/api/private-report.json")).toBe(false);
    expect(isPublicPath("/settings")).toBe(false);
  });

  it("allows only same-origin relative redirect targets", () => {
    expect(safeRedirectPath("/scholarships?page=2")).toBe("/scholarships?page=2");
    expect(safeRedirectPath("https://attacker.invalid")).toBe("/");
    expect(safeRedirectPath("//attacker.invalid/path")).toBe("/");
    expect(safeRedirectPath("/\\attacker.invalid")).toBe("/");
  });
});
