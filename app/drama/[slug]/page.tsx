import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import { description, sanitizeHtml } from "@/lib/html";
import { siteUrl } from "@/lib/seo";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params; const d=await prisma.drama.findFirst({where:{slug,status:"PUBLISHED"},select:{title:true,description:true,posterUrl:true}});
  if(!d)return{}; return {title:d.title,description:description(d.description),alternates:{canonical:siteUrl(`/drama/${slug}`)},openGraph:{title:d.title,description:description(d.description),images:d.posterUrl?[{url:d.posterUrl}]:[]}};
}

export default async function DramaPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const d=await prisma.drama.findFirst({where:{slug,status:"PUBLISHED"},include:{genre:true,episodes:{where:{status:"PUBLISHED"},orderBy:{number:"asc"}}}});
  if(!d)notFound();
  return <main><SiteHeader/><section className="container" style={{padding:"35px 0 60px"}}><div className="row gap-4" style={{alignItems:"flex-end"}}>{d.posterUrl&&<img src={d.posterUrl} alt={d.title} style={{width:180,borderRadius:12}}/>}<div><div style={{color:"#e50914",fontWeight:900}}>{d.genre?.name||"Drama"}</div><h1 style={{fontSize:44,margin:"6px 0"}}>{d.title}</h1><div className="muted" style={{lineHeight:1.8}} dangerouslySetInnerHTML={{__html:sanitizeHtml(d.description)}}/></div></div><div style={{marginTop:35}}><div className="row" style={{justifyContent:"space-between"}}><h2>Episodes</h2>{d.episodes[0]&&<Link className="btn btn-red" href={`/watch/${d.episodes[0].id}`}>▶ Start watching</Link>}</div><div className="space-y-2">{d.episodes.map(e=><Link key={e.id} href={`/watch/${e.id}`} className="card row" style={{padding:14,gap:14}}><b style={{width:40,height:40,display:"grid",placeItems:"center",background:"#222",borderRadius:8}}>{e.number}</b><div><b>{e.title}</b><div className="muted" style={{fontSize:12,marginTop:4}}>{e.duration!=null?`${Math.floor(e.duration/60)} min`:"Episode"}</div></div><span style={{marginLeft:"auto"}}>▶</span></Link>)}</div></div></section></main>;
}
