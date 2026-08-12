import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (!q || q.length > 80) return NextResponse.json([]);
  const dramas = await prisma.drama.findMany({
    where:{status:"PUBLISHED",title:{contains:q,mode:"insensitive"}},
    select:{id:true,title:true,slug:true,posterUrl:true,genre:{select:{name:true}}},
    orderBy:{updatedAt:"desc"},take:30
  });
  return NextResponse.json(dramas,{headers:{"Cache-Control":"public, s-maxage=30, stale-while-revalidate=120"}});
}
