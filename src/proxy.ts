import { NextRequest, NextResponse } from "next/server";
import { getAuthConfig } from "@/lib/auth/config";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const PUBLIC_FILE = /\.(?:avif|css|gif|ico|jpe?g|js|map|png|svg|webmanifest|webp|woff2?)$/i;

export function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return pathname.startsWith("/api/auth/") || pathname === "/api/health" || pathname === "/api/telegram/webhook";
  return pathname === "/login" || pathname.startsWith("/_next/") || PUBLIC_FILE.test(pathname);
}

export async function proxy(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();

  let authenticated = false;
  try {
    const auth = getAuthConfig();
    authenticated = Boolean(await verifySessionToken(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
      auth.AUTH_SESSION_SECRET,
      auth.ADMIN_USERNAME,
    ));
  } catch {
    authenticated = false;
  }

  if (authenticated) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, {
      status: 401,
      headers: { "cache-control": "no-store", "www-authenticate": "Session" },
    });
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(login);
  response.headers.set("cache-control", "no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
