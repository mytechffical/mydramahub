import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import DramaCard from "@/components/DramaCard";

export default async function Dramas({ searchParams }: { searchParams: Promise<{genre?:string}> }) {
  const { genre } = await searchParams;
  const dramas = await prisma.drama.findMany({
    where:{status:"PUBLISHED", ...(genre ? {genre:{slug:genre}}:{})},
    include:{genre:true},
    orderBy:{updatedAt:"desc"}
  });
  return <main><SiteHeader/><section className="container" style={{padding:"35px 0 60px"}}><h1>Dramas</h1><div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14}}>{dramas.map(d=><DramaCard key={d.id} drama={d}/>)}</div>{!dramas.length&&<p className="muted">No dramas found.</p>}</section></main>;
}
