import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.slice(0, 100);
  const status = url.searchParams.get("status") as "DISCOVERED" | "CRAWLING" | "EXTRACTED" | "NEEDS_REVIEW" | "VERIFIED" | "EXPIRED" | "REJECTED" | null;
  const items = await db.scholarship.findMany({
    where: { ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { provider: { contains: query, mode: "insensitive" } }, { hostCountry: { contains: query, mode: "insensitive" } }] } : {}), ...(status ? { status } : {}) },
    take: 100, orderBy: { updatedAt: "desc" }, include: { _count: { select: { evidence: true } } },
  });
  return NextResponse.json(items);
}
