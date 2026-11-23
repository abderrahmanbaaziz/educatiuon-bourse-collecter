import { NextResponse } from "next/server";import{z}from"zod";import{db}from"@/lib/db";import{runSerpSearch}from"@/domain/search/serpapi";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json(await db.searchRun.findMany({take:50,orderBy:{executedAt:"desc"},include:{searchQuery:true}}))}
export async function POST(request:Request){try{const input=z.object({query:z.string().min(3).max(500),language:z.string().min(2).max(10).default("en"),confirmPaidRequest:z.literal(true)}).parse(await request.json());return NextResponse.json(await runSerpSearch(input.query,input.language),{status:201})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Search failed"},{status:400})}}
