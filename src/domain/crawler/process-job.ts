import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { config, hasAIProvider } from "@/lib/config";
import { logger } from "@/lib/logger";
import { extractHtml, rankRelevantLinks, type ExtractedPage } from "./extract";
import { fetchPublicPage } from "./fetch-page";
import { canonicalizeUrl, sameSite } from "./url-policy";
import { extractXml, isXmlDocument } from "./xml";
import { needsBrowserRendering, renderPublicPage } from "./render-page";
import { invokeStructuredAI } from "../ai/client";
import { aiDecisionSchema, scholarshipExtractionSchema, validateSelectedLinks, type ScholarshipExtraction } from "../ai/schemas";
import { extractionPrompt, navigationPrompt } from "../ai/prompts";
import { scheduleCrawlFailureNotification } from "../notifications/service";

const scholarshipTerms = /scholar|bourse|fellowship|grant|funding|erasmus/i;

async function extractPdf(bytes: Uint8Array): Promise<ExtractedPage> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    const content = result.text.replace(/\s+/g, " ").trim();
    const { createHash } = await import("node:crypto");
    return { title: "PDF document", language: null, content, contentHash: createHash("sha256").update(content).digest("hex"), links: [] };
  } finally { await parser.destroy(); }
}

function safeDate(input: string | null): Date | null {
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeTitle(title: string) { return title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim(); }

async function persistExtraction(sourceId: string | null, sourceUrl: string, extraction: ScholarshipExtraction) {
  const data = {
    sourceId, title: extraction.title, normalizedTitle: normalizeTitle(extraction.title), provider: extraction.provider,
    institution: extraction.institution, hostCountry: extraction.host_country, eligibleNationalities: extraction.eligible_nationalities,
    degreeLevels: extraction.degree_levels, academicFields: extraction.academic_fields, fundingCategory: extraction.funding_category,
    tuitionCoverage: extraction.tuition_coverage, monthlyStipend: extraction.monthly_stipend, accommodation: extraction.accommodation,
    travelAllowance: extraction.travel_allowance, healthInsurance: extraction.health_insurance,
    languageRequirements: extraction.language_requirements, academicRequirements: extraction.academic_requirements,
    ageRestrictions: extraction.age_restrictions, opensAt: safeDate(extraction.opening_date), deadline: safeDate(extraction.deadline),
    academicYear: extraction.academic_year, requiredDocuments: extraction.required_documents,
    applicationProcess: extraction.application_process, applicationUrl: extraction.application_url, sourceUrl,
    publicationDate: safeDate(extraction.publication_date), language: extraction.language, confidence: extraction.confidence,
    status: "NEEDS_REVIEW" as const,
  };
  const existing = await db.scholarship.findFirst({ where: { normalizedTitle: data.normalizedTitle, provider: data.provider, academicYear: data.academicYear } });
  return db.$transaction(async (tx) => {
    const scholarship = existing
      ? await tx.scholarship.update({ where: { id: existing.id }, data })
      : await tx.scholarship.create({ data });
    if (existing) await tx.scholarshipVersion.create({ data: { scholarshipId: scholarship.id, snapshot: existing, reason: "Re-extracted from source" } });
    await tx.scholarshipEvidence.deleteMany({ where: { scholarshipId: scholarship.id, sourceUrl } });
    if (extraction.evidence.length) await tx.scholarshipEvidence.createMany({ data: extraction.evidence.map((item) => ({ scholarshipId: scholarship.id, field: item.field, value: item.value == null ? Prisma.JsonNull : item.value as Prisma.InputJsonValue, sourceUrl, evidenceText: item.evidence_text })) });
    return scholarship;
  });
}

export async function processCrawlJob(crawlJobId: string) {
  const job = await db.crawlJob.update({ where: { id: crawlJobId }, data: { status: "ACTIVE", startedAt: new Date(), error: null } });
  try {
    while (true) {
      const current = await db.crawlFrontier.findFirst({ where: { crawlJobId, status: "PENDING" }, orderBy: { createdAt: "asc" } });
      if (!current || job.pageLimit <= (await db.crawlFrontier.count({ where: { crawlJobId, status: "VISITED" } }))) break;
      await db.crawlFrontier.update({ where: { id: current.id }, data: { status: "PROCESSING", attempts: { increment: 1 } } });
      try {
        const fetched = await fetchPublicPage(current.url);
        const rawText = new TextDecoder().decode(fetched.bytes);
        const xmlDocument = isXmlDocument(fetched.contentType, fetched.url);
        let resolvedUrl = fetched.url;
        let page = fetched.contentType.includes("pdf")
          ? await extractPdf(fetched.bytes)
          : xmlDocument
            ? extractXml(rawText, fetched.url)
            : extractHtml(rawText, fetched.url);
        if (config.CRAWLER_BROWSER_ENABLED && !fetched.contentType.includes("pdf") && !xmlDocument && needsBrowserRendering(rawText, page.content)) {
          const rendered = await renderPublicPage(fetched.url);
          resolvedUrl = rendered.url;
          page = extractHtml(rendered.html, rendered.url);
        }
        if (job.sourceId) await db.sourcePage.upsert({
          where: { canonicalUrl: canonicalizeUrl(resolvedUrl) },
          update: { title: page.title, language: page.language, content: page.content, contentHash: page.contentHash, httpStatus: fetched.status, fetchedAt: new Date(), links: page.links },
          create: { sourceId: job.sourceId, url: resolvedUrl, canonicalUrl: canonicalizeUrl(resolvedUrl), title: page.title, language: page.language, content: page.content, contentHash: page.contentHash, httpStatus: fetched.status, links: page.links },
        });

        let selected = xmlDocument ? page.links.slice(0, config.CRAWLER_MAX_CHILD_URLS) : rankRelevantLinks(page.links, config.CRAWLER_MAX_CHILD_URLS);
        if (hasAIProvider && page.content.length > 100) {
          const decision = await invokeStructuredAI("CRAWL_NAVIGATION", navigationPrompt, {
            goal: "Find complete official scholarship eligibility, funding, deadline, and application information",
            url: resolvedUrl, title: page.title, content: page.content.slice(0, 30000), links: page.links,
            remaining_depth: job.maxDepth - current.depth,
          }, aiDecisionSchema);
          if (decision) {
            validateSelectedLinks(decision, new Set(page.links.map((link) => link.id)));
            const ids = new Set(decision.actions.flatMap((a) => a.type === "FOLLOW_LINKS" ? a.link_ids : []));
            if (ids.size) selected = page.links.filter((link) => ids.has(link.id)).slice(0, config.CRAWLER_MAX_CHILD_URLS);
            if (decision.is_scholarship_related) {
              const extracted = await invokeStructuredAI("SCHOLARSHIP_EXTRACTION", extractionPrompt, { url: resolvedUrl, title: page.title, content: page.content.slice(0, 50000) }, scholarshipExtractionSchema);
              if (extracted) await persistExtraction(job.sourceId, resolvedUrl, extracted);
            }
          }
        }

        if (current.depth < job.maxDepth) for (const link of selected) {
          if (!sameSite(job.rootUrl, link.url)) continue;
          await db.crawlFrontier.upsert({
            where: { crawlJobId_canonicalUrl: { crawlJobId, canonicalUrl: link.url } }, update: {},
            create: { crawlJobId, url: link.url, canonicalUrl: link.url, parentUrl: resolvedUrl, depth: current.depth + 1 },
          });
        }
        await db.$transaction([
          db.crawlFrontier.update({ where: { id: current.id }, data: { status: "VISITED" } }),
          db.crawlJob.update({ where: { id: crawlJobId }, data: { visitedCount: { increment: 1 } } }),
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn({ crawlJobId, url: current.url, error: message }, "Crawl page failed");
        await db.crawlFrontier.update({ where: { id: current.id }, data: { status: "FAILED", lastError: message } });
      }
    }
    await db.crawlJob.update({ where: { id: crawlJobId }, data: { status: "SUCCEEDED", finishedAt: new Date() } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.crawlJob.update({ where: { id: crawlJobId }, data: { status: "FAILED", error: message, finishedAt: new Date() } });
    await scheduleCrawlFailureNotification(crawlJobId).catch((notificationError) => logger.warn({ crawlJobId, notificationError }, "Could not schedule crawl failure notification"));
    throw error;
  }
}

export async function recoverInterruptedCrawls() {
  await db.crawlFrontier.updateMany({ where: { status: "PROCESSING" }, data: { status: "PENDING", lastError: "Recovered after worker restart" } });
  return db.crawlJob.findMany({ where: { status: { in: ["ACTIVE", "QUEUED"] } }, select: { id: true } });
}
