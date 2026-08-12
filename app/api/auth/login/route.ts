import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createAdminSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req:Request){
  const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  const rl=rateLimit(`login:${ip}`,8,15*60*1000);
  if(!rl.ok)return NextResponse.json({error:"Too many attempts. Try again later."},{status:429,headers:{"Retry-After":String(rl.retryAfter)}});
  const body=await req.json().catch(()=>null); const email=String(body?.email||"").trim().toLowerCase(); const password=String(body?.password||"");
  if(!email||!password)return NextResponse.json({error:"Email and password are required."},{status:400});
  const admin=await prisma.adminUser.findUnique({where:{email}});
  if(!admin||!admin.active||!verifyPassword(password,admin.passwordHash))return NextResponse.json({error:"Invalid email or password."},{status:401});
  await createAdminSession(admin.id); return NextResponse.json({ok:true});
}
