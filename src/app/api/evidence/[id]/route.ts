import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{const{id}=await params;const input=z.object({status:z.enum(["CONFIRMED","CONFLICTING","REJECTED"]),reason:z.string().min(3).max(500)}).parse(await request.json());const evidence=await db.scholarshipEvidence.findUnique({where:{id}});if(!evidence)return NextResponse.json({error:"Evidence not found"},{status:404});const updated=await db.$transaction(async(tx)=>{const item=await tx.scholarshipEvidence.update({where:{id},data:{verificationStatus:input.status}});if(input.status==="CONFIRMED")await tx.scholarshipEvidence.updateMany({where:{scholarshipId:evidence.scholarshipId,field:evidence.field,id:{not:id},verificationStatus:"EXTRACTED"},data:{verificationStatus:"CONFLICTING"}});await tx.scholarshipVersion.create({data:{scholarshipId:evidence.scholarshipId,snapshot:{evidenceId:id,status:input.status},reason:input.reason}});return item});return NextResponse.json(updated)}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Evidence update failed"},{status:400})}
}
