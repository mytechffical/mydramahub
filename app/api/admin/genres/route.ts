import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function POST(req:Request){if(!(await getAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});const b=await req.json().catch(()=>null);const name=String(b?.name||"").trim();if(!name)return NextResponse.json({error:"Name required"},{status:400});const slug=slugify(name);try{const g=await prisma.genre.create({data:{name,slug}});return NextResponse.json(g)}catch(err:any){if(err?.code==="P2002")return NextResponse.json({error:"That genre already exists."},{status:409});return NextResponse.json({error:"Could not create genre."},{status:500})}}
