import { NextResponse } from "next/server";
import { z } from "zod";
import { parseSourceImport } from "@/domain/sources/import";
import { createSourceAndCrawl } from "@/domain/sources/service";

export async function POST(request: Request) {
  try {
    const input = z.object({ content: z.string().min(2), format: z.enum(["json", "csv", "markdown"]), startCrawls: z.boolean().default(true) }).parse(await request.json());
    const rows = parseSourceImport(input.content, input.format);
    const result = { created: 0, duplicates: 0, failed: [] as Array<{ row: number; error: string }> };
    for (const [index, row] of rows.entries()) try {
      await createSourceAndCrawl({ ...row, startCrawl: input.startCrawls }); result.created++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Unique constraint")) result.duplicates++; else result.failed.push({ row: index + 1, error: message });
    }
    return NextResponse.json(result, { status: result.failed.length ? 207 : 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 400 }); }
}
