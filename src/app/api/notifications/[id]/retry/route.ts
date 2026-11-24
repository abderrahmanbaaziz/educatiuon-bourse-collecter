import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retryNotification } from "@/lib/queue";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){try{const{id}=await params;const delivery=await db.notificationDelivery.findUnique({where:{id}});if(!delivery)return NextResponse.json({error:"Delivery not found"},{status:404});if(delivery.status==="SENT")return NextResponse.json({error:"Sent deliveries cannot be retried"},{status:409});await db.notificationDelivery.update({where:{id},data:{status:"PENDING",error:null}});await retryNotification(id);return NextResponse.json({queued:true},{status:202})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Retry failed"},{status:400})}}
