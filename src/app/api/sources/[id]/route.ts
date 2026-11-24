import { NextResponse } from "next/server";
import { z } from "zod";
import { setSourceEnabled } from "@/domain/sources/service";

const inputSchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = inputSchema.parse(await request.json());
    return NextResponse.json(await setSourceEnabled(id, input.enabled));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update source" }, { status: 400 });
  }
}
