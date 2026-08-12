import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";

export default async function Genres() {
  const genres = await prisma.genre.findMany({ orderBy:{name:"asc"}, include:{_count:{select:{dramas:{where:{status:"PUBLISHED"}}}}} });
  return <main><SiteHeader/><section className="container" style={{padding:"35px 0 60px"}}><h1>Genres</h1><div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>{genres.map(g=><Link key={g.id} href={`/dramas?genre=${g.slug}`} className="card" style={{padding:18}}><b>{g.name}</b><div className="muted" style={{fontSize:12,marginTop:5}}>{g._count.dramas} dramas</div></Link>)}</div></section></main>;
}
