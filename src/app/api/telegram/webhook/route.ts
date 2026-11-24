import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { config, hasTelegramWebhook } from "@/lib/config";
import { telegramUpdateSchema } from "@/domain/notifications/telegram";
import { enqueueAutomation } from "@/lib/queue";

export const dynamic = "force-dynamic";

function secretMatches(candidate: string | null) {
  const expected = config.TELEGRAM_WEBHOOK_SECRET;
  if (!hasTelegramWebhook || !expected || !candidate) return false;
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401, headers: { "cache-control": "no-store" } });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 100_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  try {
    const update = telegramUpdateSchema.parse(await request.json());
    await enqueueAutomation("telegram-update", { update });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid Telegram update" }, { status: 400 });
  }
}
