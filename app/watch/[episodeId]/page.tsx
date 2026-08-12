import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import AdaptivePlayer from "@/components/AdaptivePlayer";
import { description, sanitizeHtml } from "@/lib/html";

export default async function Watch({params}:{params:Promise<{episodeId:string}>}){
  const {episodeId}=await params; const id=Number(episodeId); if(!Number.isInteger(id))notFound();
  const e=await prisma.episode.findFirst({where:{id,status:"PUBLISHED",drama:{status:"PUBLISHED"}},include:{drama:{select:{title:true,slug:true,episodes:{where:{status:"PUBLISHED"},orderBy:{number:"asc"},select:{id:true,number:true,title:true}}}}}});
  if(!e)notFound();
  const i=e.drama.episodes.findIndex(x=>x.id===e.id); const prev=e.drama.episodes[i-1]; const next=e.drama.episodes[i+1];
  await prisma.episode.update({where:{id:e.id},data:{views:{increment:1}}}).catch(()=>{});
  return <main><SiteHeader/><section className="container" style={{padding:"20px 0 60px"}}><div className="video-wrap"><AdaptivePlayer episodeId={e.id} hlsUrl={e.hlsUrl} fallbackUrl={e.videoUrl} poster={e.thumbnailUrl} subtitleUrl={e.subtitleUrl}/></div><div style={{padding:"20px 0"}}><Link href={`/drama/${e.drama.slug}`} style={{color:"#e50914",fontWeight:900}}>{e.drama.title}</Link><h1 style={{margin:"6px 0"}}>Episode {e.number}: {e.title}</h1><div className="muted" dangerouslySetInnerHTML={{__html:sanitizeHtml(e.description)}}/><div className="row gap-2" style={{marginTop:18}}>{prev&&<Link className="btn btn-dark" href={`/watch/${prev.id}`}>← Previous</Link>}{next&&<Link className="btn btn-light" href={`/watch/${next.id}`}>Next →</Link>}</div></div><h3>Episodes</h3><div className="row" style={{gap:8,flexWrap:"wrap"}}>{e.drama.episodes.map(x=><Link key={x.id} className={`btn ${x.id===e.id?"btn-red":"btn-dark"}`} href={`/watch/${x.id}`}>{x.number}</Link>)}</div></section></main>;
}
