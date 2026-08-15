import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import { description, sanitizeHtml } from "@/lib/html";
import { siteUrl, safeJsonLd } from "@/lib/seo";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const d=await prisma.drama.findFirst({where:{slug,status:"PUBLISHED"},select:{title:true,description:true,posterUrl:true,genre:{select:{name:true}}}});
  if(!d)return{};
  const desc=description(d.description);
  const image=d.posterUrl?[{url:d.posterUrl,width:600,height:900,alt:d.title}]:undefined;
  return {
    title:d.title,
    description:desc,
    alternates:{canonical:siteUrl(`/drama/${slug}`)},
    openGraph:{type:"video.tv_show",title:d.title,description:desc,url:siteUrl(`/drama/${slug}`),images:image},
    twitter:{card:"summary_large_image",title:d.title,description:desc,images:image?.map(i=>i.url)}
  };
}

export default async function DramaPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const d=await prisma.drama.findFirst({where:{slug,status:"PUBLISHED"},include:{genre:true,episodes:{where:{status:"PUBLISHED"},orderBy:{number:"asc"}}}});
  if(!d)notFound();

  const breadcrumb={
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem",position:1,name:"Home",item:siteUrl("/")},
      {"@type":"ListItem",position:2,name:"Dramas",item:siteUrl("/dramas")},
      ...(d.genre?[{"@type":"ListItem",position:3,name:d.genre.name,item:siteUrl(`/dramas?genre=${d.genre.slug}`)}]:[]),
      {"@type":"ListItem",position:d.genre?4:3,name:d.title,item:siteUrl(`/drama/${slug}`)}
    ]
  };
  const series={
    "@context":"https://schema.org","@type":"TVSeries",
    name:d.title,
    description:description(d.description,500),
    url:siteUrl(`/drama/${slug}`),
    ...(d.posterUrl?{image:d.posterUrl}:{}),
    ...(d.genre?{genre:d.genre.name}:{}),
    numberOfEpisodes:d.episodes.length,
    episode:d.episodes.map(e=>({
      "@type":"TVEpisode",
      episodeNumber:e.number,
      name:e.title,
      url:siteUrl(`/watch/${e.id}`),
      ...(e.thumbnailUrl?{image:e.thumbnailUrl}:{})
    }))
  };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(breadcrumb)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(series)}}/>
    <SiteHeader/>
    <section className="container" style={{padding:"35px 0 60px"}}>
      <div className="drama-hero-row">
        {d.posterUrl&&<img src={d.posterUrl} alt={d.title} className="drama-hero-poster"/>}
        <div className="drama-hero-info">
          <div style={{color:"#e50914",fontWeight:900}}>{d.genre?.name||"Drama"}</div>
          <h1 style={{fontSize:"clamp(26px,6vw,44px)",margin:"6px 0"}}>{d.title}</h1>
          <div className="muted" style={{lineHeight:1.8}} dangerouslySetInnerHTML={{__html:sanitizeHtml(d.description)}}/>
        </div>
      </div>
      <div style={{marginTop:35}}>
        <div className="ep-actions-row">
          <h2 style={{margin:0}}>Episodes</h2>
          {d.episodes[0]&&<Link className="btn btn-red" href={`/watch/${d.episodes[0].id}`}>▶ Start watching</Link>}
        </div>
        <div className="space-y-2" style={{marginTop:16}}>
          {d.episodes.map(e=><Link key={e.id} href={`/watch/${e.id}`} className="card row" style={{padding:14,gap:14}}>
            <b style={{width:40,height:40,display:"grid",placeItems:"center",background:"#222",borderRadius:8,flexShrink:0}}>{e.number}</b>
            <div style={{minWidth:0}}><b>{e.title}</b><div className="muted" style={{fontSize:12,marginTop:4}}>{e.duration!=null?`${Math.floor(e.duration/60)} min`:"Episode"}</div></div>
            <span style={{marginLeft:"auto",flexShrink:0}}>▶</span>
          </Link>)}
        </div>
      </div>
    </section>
  </main>;
}
