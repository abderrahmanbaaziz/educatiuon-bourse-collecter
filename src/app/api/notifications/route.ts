import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json(await db.notificationDelivery.findMany({take:100,orderBy:{createdAt:"desc"},select:{id:true,eventType:true,entityType:true,entityId:true,status:true,attempts:true,externalMessageId:true,error:true,sentAt:true,createdAt:true,updatedAt:true}}))}
