import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await db.systemSetting.findMany({ orderBy: { key: "asc" } })); }
export async function PATCH(request: Request) {
  try {
    const input = z.object({ key: z.string().min(1), value: z.unknown() }).parse(await request.json());
    const allowed = new Set(["discovery.paused", "crawler.maxDepth", "crawler.pageLimit", "budget.aiMonthlyUsd", "budget.serpApiMonthly", "notifications.telegram.enabled", "notifications.telegram.newCandidates", "notifications.telegram.verifiedScholarships", "notifications.telegram.crawlFailures"]);
    if (!allowed.has(input.key)) return NextResponse.json({ error: "Setting is not editable" }, { status: 403 });
    const value = input.value === null ? Prisma.JsonNull : input.value as Prisma.InputJsonValue;
    return NextResponse.json(await db.systemSetting.update({ where: { key: input.key }, data: { value } }));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid setting" }, { status: 400 }); }
}

