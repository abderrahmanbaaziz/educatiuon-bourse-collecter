import { NextResponse } from "next/server";import { db } from "@/lib/db";
export const dynamic="force-dynamic";export async function GET(){return NextResponse.json(await db.aIInvocation.findMany({take:100,orderBy:{createdAt:"desc"}}))}
