import { NextResponse } from "next/server";
import { startSourceCrawl } from "@/domain/sources/service";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  try{const{id}=await params;return NextResponse.json(await startSourceCrawl(id),{status:202})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not start crawl"},{status:400})}
}
