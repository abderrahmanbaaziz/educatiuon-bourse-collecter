import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSourceAndCrawl, createSourceSchema } from "@/domain/sources/service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await db.source.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "desc" }], include: { _count: { select: { pages: true, crawlJobs: true } } } }));
}

export async function POST(request: Request) {
  try {
    const input = createSourceSchema.parse(await request.json());
    return NextResponse.json(await createSourceAndCrawl(input), { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "This source URL already exists" }, { status: 409 });
    const message = error instanceof Error ? error.message : "Invalid source";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
