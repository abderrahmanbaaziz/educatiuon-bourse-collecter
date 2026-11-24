import { z } from "zod";

export const aiDecisionSchema = z.object({
  actions: z.array(z.discriminatedUnion("type", [
    z.object({ type: z.literal("FOLLOW_LINKS"), link_ids: z.array(z.string()).max(20), reason: z.string() }),
    z.object({ type: z.enum(["EXTRACT", "REQUEST_MORE_CONTENT", "COMPLETE", "STOP", "NEEDS_REVIEW"]), reason: z.string() }),
  ])).max(5),
  is_scholarship_related: z.boolean(),
  investigation_complete: z.boolean(),
  confidence: z.number().min(0).max(1),
});

const nullableText = z.string().nullable();
export const scholarshipExtractionSchema = z.object({
  title: z.string().min(2), provider: nullableText, institution: nullableText, host_country: nullableText,
  opportunity_type: z.enum(["SCHOLARSHIP", "INVITATION", "CONFERENCE", "TRAINING", "EXCHANGE_NOTICE", "OTHER", "UNKNOWN"]),
  algeria_eligibility: z.enum(["CONFIRMED", "NOT_ELIGIBLE", "UNKNOWN"]), algeria_eligibility_reason: nullableText,
  application_status: z.enum(["OPEN", "UPCOMING", "CLOSED", "UNKNOWN"]),
  application_link_type: z.enum(["DIRECT_APPLY", "DETAILS_ONLY", "NONE"]),
  eligible_nationalities: z.array(z.string()), degree_levels: z.array(z.string()), academic_fields: z.array(z.string()),
  funding_category: z.enum(["FULL", "PARTIAL", "UNKNOWN"]), tuition_coverage: nullableText, monthly_stipend: nullableText,
  accommodation: nullableText, travel_allowance: nullableText, health_insurance: nullableText,
  language_requirements: nullableText, academic_requirements: nullableText, age_restrictions: nullableText,
  opening_date: nullableText, deadline: nullableText, academic_year: nullableText, required_documents: z.array(z.string()),
  application_process: nullableText, application_url: nullableText, publication_date: nullableText, language: nullableText,
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.object({ field: z.string(), value: z.unknown(), evidence_text: z.string().min(1) })),
});

export type AIDecision = z.infer<typeof aiDecisionSchema>;
export type ScholarshipExtraction = z.infer<typeof scholarshipExtractionSchema>;

export function validateSelectedLinks(decision: AIDecision, validIds: Set<string>) {
  for (const action of decision.actions) if (action.type === "FOLLOW_LINKS") {
    for (const id of action.link_ids) if (!validIds.has(id)) throw new Error(`AI selected unknown link ID: ${id}`);
  }
  return decision;
}
