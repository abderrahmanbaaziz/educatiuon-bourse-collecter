import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { allowedTransitions, evaluateVerification } from "@/domain/scholarships/verification";
import { scheduleVerifiedScholarshipNotification } from "@/domain/notifications/service";
import { logger } from "@/lib/logger";

const inputSchema = z.object({
  status: z.enum(["DISCOVERED", "CRAWLING", "EXTRACTED", "NEEDS_REVIEW", "VERIFIED", "EXPIRED", "REJECTED"]),
  reason: z.string().trim().min(5).max(1000),
  actor: z.string().trim().min(2).max(100).default("administrator"),
  trustSource: z.boolean().default(false),
});

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params; const input=inputSchema.parse(await request.json());
    const scholarship=await db.scholarship.findUnique({where:{id},include:{source:true,evidence:{select:{field:true}}}});
    if(!scholarship)return NextResponse.json({error:"Scholarship not found"},{status:404});
    if(!allowedTransitions[scholarship.status].includes(input.status))return NextResponse.json({error:`Transition ${scholarship.status} -> ${input.status} is not allowed`},{status:409});
    if(input.trustSource && input.status !== "VERIFIED")return NextResponse.json({error:"A source can only be trusted during verification"},{status:400});
    if(input.status==="VERIFIED"){
      const effectiveTrustLevel=input.trustSource ? "TRUSTED" : scholarship.source?.trustLevel??null;
      const policy=evaluateVerification({currentStatus:scholarship.status,trustLevel:effectiveTrustLevel,evidenceFields:scholarship.evidence.map((item)=>item.field),sourceUrl:scholarship.sourceUrl,applicationUrl:scholarship.applicationUrl,algeriaEligibility:scholarship.algeriaEligibility,opportunityType:scholarship.opportunityType,applicationStatus:scholarship.applicationStatus,directApplicationVerified:scholarship.directApplicationVerified});
      if(!policy.allowed)return NextResponse.json({error:"Verification requirements are not met",reasons:policy.reasons},{status:422});
    }
    const updated=await db.$transaction(async(tx)=>{
      if(input.trustSource && scholarship.sourceId && scholarship.source?.trustLevel === "UNVERIFIED")await tx.source.update({where:{id:scholarship.sourceId},data:{trustLevel:"TRUSTED"}});
      const reason=input.trustSource ? `${input.reason} (linked source manually approved during review)` : input.reason;
      await tx.scholarshipStatusHistory.create({data:{scholarshipId:id,fromStatus:scholarship.status,toStatus:input.status,reason,actor:input.actor}});
      return tx.scholarship.update({where:{id},data:{status:input.status}})
    });
    if(input.status==="VERIFIED")await scheduleVerifiedScholarshipNotification(id).catch((notificationError)=>logger.warn({scholarshipId:id,notificationError},"Could not schedule verified scholarship notification"));
    return NextResponse.json(updated);
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Status update failed"},{status:400})}
}
