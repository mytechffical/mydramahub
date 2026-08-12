import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { sanitizeHtml } from "@/lib/html";

export async function POST(req:Request){
  if(!(await getAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const b=await req.json().catch(()=>null);const title=String(b?.title||"").trim();if(!title)return NextResponse.json({error:"Title is required."},{status:400});
  let slug=slugify(String(b?.slug||title)); const exists=await prisma.drama.findUnique({where:{slug}});if(exists)slug=`${slug}-${Date.now().toString().slice(-6)}`;
  const genreIdNum=Number(b?.genreId);const genreId=(b?.genreId&&Number.isFinite(genreIdNum))?genreIdNum:null;
  try{
    const d=await prisma.drama.create({data:{title,slug,description:sanitizeHtml(String(b?.description||"")),posterUrl:String(b?.posterUrl||"")||null,bannerUrl:String(b?.bannerUrl||"")||null,genreId,status:b?.status==="PUBLISHED"?"PUBLISHED":"DRAFT",featured:Boolean(b?.featured)}});
    return NextResponse.json({id:d.id});
  }catch(err:any){
    if(err?.code==="P2003")return NextResponse.json({error:"That genre doesn't exist."},{status:400});
    if(err?.code==="P2002")return NextResponse.json({error:"Slug already exists."},{status:409});
    return NextResponse.json({error:"Could not create drama."},{status:500});
  }
}
