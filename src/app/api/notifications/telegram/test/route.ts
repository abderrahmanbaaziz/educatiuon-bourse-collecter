import { NextResponse } from "next/server";
import { z } from "zod";
import { hasTelegramProvider } from "@/lib/config";
import { scheduleTelegramTest } from "@/domain/notifications/service";

export async function POST(request:Request){try{z.object({confirm:z.literal(true)}).parse(await request.json());if(!hasTelegramProvider)return NextResponse.json({error:"TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required"},{status:400});const delivery=await scheduleTelegramTest();return NextResponse.json(delivery,{status:202})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not queue test"},{status:400})}}
