import type { ScholarshipExtraction } from "@/domain/ai/schemas";

type PageLink = { url: string };

function normalizedUrl(input: string) {
  try {
    const url = new URL(input);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch { return null; }
}

export function evaluateAlgeriaGate(extraction: ScholarshipExtraction, sourceUrl: string, links: PageLink[]) {
  const reasons: string[] = [];
  const evidence = extraction.evidence.map((item) => `${item.field} ${item.evidence_text}`).join(" ");
  const hasAlgeriaEvidence = /algeri|algérie|algérien|الجزائر/i.test(evidence)
    && extraction.evidence.some((item) => /eligib|national|country|pays|algeria/i.test(item.field));
  const applicationUrl = extraction.application_url ? normalizedUrl(extraction.application_url) : null;
  const source = normalizedUrl(sourceUrl);
  const linked = applicationUrl !== null && (applicationUrl === source || links.some((link) => normalizedUrl(link.url) === applicationUrl));
  const hasApplicationEvidence = extraction.evidence.some((item) => /application(url|process)?|apply|candidature/i.test(item.field));
  const directApplicationVerified = extraction.application_link_type === "DIRECT_APPLY" && linked && hasApplicationEvidence;

  if (extraction.opportunity_type !== "SCHOLARSHIP") reasons.push("not a scholarship funding opportunity");
  if (extraction.algeria_eligibility !== "CONFIRMED") reasons.push("Algerian eligibility is not explicitly confirmed");
  if (!hasAlgeriaEvidence) reasons.push("Algerian eligibility has no explicit page evidence");
  if (extraction.application_status !== "OPEN") reasons.push("applications are not confirmed open");
  if (extraction.deadline) {
    const deadline = Date.parse(extraction.deadline);
    if (!Number.isNaN(deadline) && deadline < Date.now()) reasons.push("application deadline has passed");
  }
  if (!directApplicationVerified) reasons.push("no validated direct application form or portal link");

  return { accepted: reasons.length === 0, reasons, applicationUrl, directApplicationVerified };
}
