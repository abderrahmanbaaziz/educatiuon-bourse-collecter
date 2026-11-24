import { z } from "zod";
import { config, hasTelegramProvider } from "@/lib/config";

const responseSchema = z.object({ ok:z.boolean(), result:z.object({ message_id:z.number() }).optional(), description:z.string().optional(), parameters:z.object({ retry_after:z.number().optional() }).optional() });
const updatesResponseSchema = z.object({
  ok: z.boolean(),
  result: z.array(z.object({
    update_id: z.number().int(),
    message: z.object({
      text: z.string().optional(),
      chat: z.object({ id: z.union([z.number(), z.string()]) }),
    }).optional(),
  })).default([]),
  description: z.string().optional(),
  parameters: z.object({ retry_after: z.number().int().positive().optional() }).optional(),
});

export function escapeTelegramHtml(value:string) { return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function escapeTelegramAttribute(value:string) { return escapeTelegramHtml(value).replace(/"/g,"&quot;"); }

export function formatScholarshipMessage(scholarship:{title:string;provider:string|null;institution:string|null;hostCountry:string|null;degreeLevels:string[];fundingCategory:string;deadline:Date|null;eligibleNationalities:string[];applicationUrl:string|null;sourceUrl:string}) {
  const lines=[`<b>New verified scholarship</b>`,``,`<b>${escapeTelegramHtml(scholarship.title)}</b>`];
  if(scholarship.provider||scholarship.institution)lines.push(escapeTelegramHtml(scholarship.provider??scholarship.institution!));
  if(scholarship.hostCountry)lines.push(`Host country: ${escapeTelegramHtml(scholarship.hostCountry)}`);
  if(scholarship.degreeLevels.length)lines.push(`Degree: ${escapeTelegramHtml(scholarship.degreeLevels.join(", "))}`);
  lines.push(`Funding: ${escapeTelegramHtml(scholarship.fundingCategory.toLowerCase())}`);
  if(scholarship.deadline)lines.push(`Deadline: ${scholarship.deadline.toISOString().slice(0,10)}`);
  if(scholarship.eligibleNationalities.length)lines.push(`Eligibility listed: ${escapeTelegramHtml(scholarship.eligibleNationalities.slice(0,8).join(", "))}`);
  let link=scholarship.sourceUrl;try{const candidate=new URL(scholarship.applicationUrl??scholarship.sourceUrl);if(["http:","https:"].includes(candidate.protocol))link=candidate.toString()}catch{/* retain the crawler-validated source URL */}lines.push(``,`<a href="${escapeTelegramAttribute(link)}">Official details / application</a>`);
  return lines.join("\n").slice(0,4096);
}

export function formatCandidateMessage(scholarship:{title:string;provider:string|null;institution:string|null;hostCountry:string|null;degreeLevels:string[];fundingCategory:string;deadline:Date|null;eligibleNationalities:string[];applicationUrl:string|null;sourceUrl:string}) {
  return formatScholarshipMessage(scholarship).replace("<b>New verified scholarship</b>", "<b>New scholarship candidate</b>\nNeeds dashboard review");
}

export function formatCrawlFailureMessage(job:{id:string;rootUrl:string;error:string|null;source:{providerName:string}|null}) {
  return [`<b>Crawler failure</b>`,`Source: ${escapeTelegramHtml(job.source?.providerName??job.rootUrl)}`,`Job: <code>${escapeTelegramHtml(job.id)}</code>`,`Error: ${escapeTelegramHtml(job.error??"Unknown error")}`].join("\n").slice(0,4096);
}

export async function sendTelegramMessage(text:string) {
  if(!hasTelegramProvider)throw new Error("Telegram bot token and chat ID are not configured");
  const response=await fetch(`https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:config.TELEGRAM_CHAT_ID,text,parse_mode:"HTML",link_preview_options:{is_disabled:true},...(config.TELEGRAM_MESSAGE_THREAD_ID?{message_thread_id:config.TELEGRAM_MESSAGE_THREAD_ID}:{})}),signal:AbortSignal.timeout(15000)});
  const payload=responseSchema.parse(await response.json());
  if(!response.ok||!payload.ok||!payload.result)throw new Error(payload.description??`Telegram returned HTTP ${response.status}`);
  return String(payload.result.message_id);
}

export async function getTelegramUpdates(offset: number) {
  if(!hasTelegramProvider) return { updates: [], retryAfterSeconds: 0 };
  const params = new URLSearchParams({ offset: String(offset), limit: "20", timeout: "45", allowed_updates: JSON.stringify(["message"]) });
  const response = await fetch(`https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getUpdates?${params}`, { signal: AbortSignal.timeout(55_000) });
  const payload = updatesResponseSchema.parse(await response.json());
  if(response.status === 429 && payload.parameters?.retry_after) return { updates: [], retryAfterSeconds: payload.parameters.retry_after };
  if(!response.ok || !payload.ok) throw new Error(payload.description ?? `Telegram returned HTTP ${response.status}`);
  return { updates: payload.result, retryAfterSeconds: 0 };
}
