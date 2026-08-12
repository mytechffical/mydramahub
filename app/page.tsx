import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import DramaCard from "@/components/DramaCard";

export default async function Home() {
  const [featured, latest] = await Promise.all([
    prisma.drama.findFirst({ where:{status:"PUBLISHED",featured:true}, include:{genre:true} }),
    prisma.drama.findMany({ where:{status:"PUBLISHED"}, include:{genre:true}, orderBy:{updatedAt:"desc"}, take:12 })
  ]);
  return <main>
    <SiteHeader />
    <section className="hero">
      <div className="container" style={{padding:"70px 0"}}>
        <p style={{color:"#e50914",fontWeight:900,textTransform:"uppercase"}}>Free streaming</p>
        <h1 style={{fontSize:"clamp(38px,7vw,72px)",maxWidth:760,margin:"8px 0",fontWeight:950}}>{featured?.title || "Watch dramas for free."}</h1>
        <p className="muted" style={{maxWidth:680,lineHeight:1.8}}>{featured ? "Watch the latest episodes with a simple, fast and free streaming experience." : "Build your library from the admin panel and publish dramas here."}</p>
        <div className="row gap-2" style={{marginTop:20}}>
          <Link className="btn btn-red" href={featured ? `/drama/${featured.slug}` : "/dramas"}>Watch now</Link>
          <Link className="btn btn-dark" href="/dramas">Browse dramas</Link>
        </div>
      </div>
    </section>
    <section className="container" style={{padding:"35px 0 60px"}}>
      <div className="row" style={{justifyContent:"space-between",marginBottom:16}}><h2 style={{margin:0}}>Latest dramas</h2><Link className="muted" href="/dramas">View all →</Link></div>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14}}>{latest.map(d=><DramaCard key={d.id} drama={d}/>)}</div>
    </section>
  </main>;
}
