import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateVerification } from "@/domain/scholarships/verification";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const idSchema = z.string().trim().min(1).max(128);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = idSchema.parse((await params).id);
    const scholarship = await db.scholarship.findUnique({
      where: { id },
      include: {
        source: {
          select: {
            id: true,
            providerName: true,
            homepage: true,
            scholarshipUrl: true,
            trustLevel: true,
          },
        },
        evidence: { orderBy: { createdAt: "desc" } },
        statusHistory: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!scholarship) return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });

    const verification = evaluateVerification({
      currentStatus: scholarship.status,
      trustLevel: scholarship.source?.trustLevel ?? null,
      evidenceFields: scholarship.evidence.map((item) => item.field),
      sourceUrl: scholarship.sourceUrl,
      applicationUrl: scholarship.applicationUrl,
      algeriaEligibility: scholarship.algeriaEligibility,
      opportunityType: scholarship.opportunityType,
      applicationStatus: scholarship.applicationStatus,
      directApplicationVerified: scholarship.directApplicationVerified,
    });

    return NextResponse.json({ ...scholarship, verification });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid scholarship identifier" }, { status: 400 });
    return NextResponse.json({ error: "Scholarship details could not be loaded" }, { status: 500 });
  }
}
