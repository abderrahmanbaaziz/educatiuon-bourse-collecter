import { NextResponse } from "next/server";
import { cancelCrawlJob } from "@/domain/sources/service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await cancelCrawlJob(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not stop crawl" }, { status: 400 });
  }
}
