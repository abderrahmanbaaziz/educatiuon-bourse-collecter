export const SESSION_COOKIE_NAME = "__Host-bourse_session";

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
  nonce: string;
};

const encoder = new TextEncoder();

function encodeBase64Url(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(input: string): Uint8Array<ArrayBuffer> {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionToken(
  username: string,
  secret: string,
  ttlSeconds: number,
  now = Math.floor(Date.now() / 1000),
): Promise<string> {
  const nonce = encodeBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  const payload = encodeBase64Url(JSON.stringify({ sub: username, iat: now, exp: now + ttlSeconds, nonce } satisfies SessionPayload));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await signingKey(secret), encoder.encode(payload)));
  return `${payload}.${encodeBase64Url(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  expectedUsername: string,
  now = Math.floor(Date.now() / 1000),
): Promise<SessionPayload | null> {
  if (!token || token.length > 2048) return null;
  const [payloadRaw, signatureRaw, extra] = token.split(".");
  if (!payloadRaw || !signatureRaw || extra !== undefined) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret),
      decodeBase64Url(signatureRaw),
      encoder.encode(payloadRaw),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(payloadRaw))) as Partial<SessionPayload>;
    if (
      payload.sub !== expectedUsername || !Number.isInteger(payload.iat) || !Number.isInteger(payload.exp) ||
      typeof payload.nonce !== "string" || payload.nonce.length < 16 ||
      (payload.iat as number) > now + 60 || (payload.exp as number) <= now
    ) return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge,
});

export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://local.invalid");
    return url.origin === "https://local.invalid" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
