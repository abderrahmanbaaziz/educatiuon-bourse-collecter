import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/auth/request";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const response = request.headers.get("accept")?.includes("application/json")
    ? new NextResponse(null, { status: 204 })
    : new NextResponse(null, { status: 303, headers: { location: "/login" } });
  response.cookies.set(SESSION_COOKIE_NAME, "", sessionCookieOptions(0));
  response.headers.set("cache-control", "no-store");
  return response;
}
