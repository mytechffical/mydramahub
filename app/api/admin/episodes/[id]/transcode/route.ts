import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){if(!(await getAdminId()))return NextResponse.json({error:"Unauthorized"},{status:401});const{id}=await params;const idNum=Number(id);if(!Number.isInteger(idNum))return NextResponse.json({error:"Invalid episode id."},{status:400});const e=await prisma.episode.findUnique({where:{id:idNum}});if(!e)return NextResponse.json({error:"Episode not found."},{status:404});if(!e.videoUrl)return NextResponse.json({error:"Add a video URL first."},{status:400});const x=await prisma.episode.update({where:{id:e.id},data:{processingStatus:"QUEUED",processingError:null}});return NextResponse.json({ok:true,status:x.processingStatus})}
