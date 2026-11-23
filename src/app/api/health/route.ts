import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pingRedis } from "@/lib/queue";
import { hasAIProvider, hasSearchProvider, hasTelegramProvider } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};
  try { await db.$queryRaw`SELECT 1`; checks.database = "up"; } catch { checks.database = "down"; }
  try { checks.redis = (await pingRedis()) === "PONG" ? "up" : "down"; } catch { checks.redis = "down"; }
  const healthy = checks.database === "up" && checks.redis === "up";
  return NextResponse.json({ status: healthy ? "healthy" : "degraded", checks, providers: { ai: hasAIProvider ? "configured" : "disabled", search: hasSearchProvider ? "configured" : "disabled", telegram: hasTelegramProvider ? "configured" : "disabled" }, timestamp: new Date().toISOString() }, { status: healthy ? 200 : 503 });
}
