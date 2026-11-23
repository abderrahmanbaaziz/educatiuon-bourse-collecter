import { parse } from "csv-parse/sync";
import { z } from "zod";
import { createSourceSchema } from "./service";

const importRowSchema = z.object({
  providerName: z.string().min(2), homepage: z.string().url(), scholarshipUrl: z.string().url(),
  hostCountry: z.string().nullable().optional(), languages: z.union([z.array(z.string()), z.string()]).optional(),
  category: z.enum(["UNIVERSITY", "GOVERNMENT", "PROGRAM", "PORTAL", "NGO", "OTHER"]).optional(),
  trustLevel: z.enum(["UNVERIFIED", "TRUSTED", "OFFICIAL"]).optional(), priority: z.coerce.number().int().min(0).max(100).optional(), notes: z.string().nullable().optional(),
});

export type ImportSource = z.infer<typeof createSourceSchema>;

function markdownRows(content:string):unknown[]{
  const rows:unknown[]=[];const seen=new Set<string>();const linkPattern=/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;let match:RegExpExecArray|null;
  while((match=linkPattern.exec(content))){const providerName=match[1].replace(/[*_`]/g,"").trim();const scholarshipUrl=match[2].replace(/[.,;]+$/,"");if(seen.has(scholarshipUrl))continue;seen.add(scholarshipUrl);try{const url=new URL(scholarshipUrl);const host=url.hostname.toLowerCase();const category=/(\.edu\.|\.ac\.|univ-|university|universite)/.test(`${host} ${providerName.toLowerCase()}`)?"UNIVERSITY":/(gov|gouv|emb-|mofa|ministry|ministere|mesrs|europa\.eu)/.test(`${host} ${providerName.toLowerCase()}`)?"GOVERNMENT":"PORTAL";rows.push({providerName:providerName.slice(0,200),homepage:`${url.protocol}//${url.host}/`,scholarshipUrl,category,trustLevel:"UNVERIFIED",priority:/\bP0\b/.test(content.slice(Math.max(0,match.index-500),match.index+500))?90:50,notes:"Imported from Markdown seed registry"})}catch{/* invalid Markdown URL */}
  }return rows;
}

export function parseSourceImport(content: string, format: "json" | "csv" | "markdown"): ImportSource[] {
  if (Buffer.byteLength(content) > 2_000_000) throw new Error("Import exceeds 2 MB limit");
  const raw: unknown[] = format === "json"
    ? (() => { const parsed: unknown = JSON.parse(content); return Array.isArray(parsed) ? parsed : [parsed]; })()
    : format === "markdown" ? markdownRows(content)
    : parse(content, { columns: true, skip_empty_lines: true, trim: true, bom: true, max_record_size: 20_000 });
  if (raw.length > 1000) throw new Error("Import is limited to 1,000 sources");
  return raw.map((row, index) => {
    try {
      const parsed = importRowSchema.parse(row);
      const languages = Array.isArray(parsed.languages) ? parsed.languages : (parsed.languages ?? "").split(/[,;|]/).map((value) => value.trim()).filter(Boolean);
      return createSourceSchema.parse({ ...parsed, languages, startCrawl: true });
    } catch (error) { throw new Error(`Invalid source at row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`); }
  });
}
