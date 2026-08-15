import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReelsFeed from "@/components/ReelsFeed";
import { description as toPlainText } from "@/lib/html";
import { siteUrl, safeJsonLd, toIsoDuration } from "@/lib/seo";

async function getEpisode(id: number) {
  return prisma.episode.findFirst({
    where:{id,status:"PUBLISHED",drama:{status:"PUBLISHED"}},
    select:{
      id:true,number:true,title:true,description:true,thumbnailUrl:true,duration:true,createdAt:true,
      drama:{select:{title:true,slug:true,posterUrl:true,genre:{select:{name:true,slug:true}}}}
    }
  });
}

export async function generateMetadata({params}:{params:Promise<{episodeId:string}>}):Promise<Metadata>{
  const id=Number((await params).episodeId);
  if(!Number.isInteger(id))return{};
  const ep=await getEpisode(id);
  if(!ep)return{};
  const title=`Episode ${ep.number}: ${ep.title}`;
  const desc=toPlainText(ep.description,160)||`Watch ${ep.drama.title} episode ${ep.number} free.`;
  const image=ep.thumbnailUrl||ep.drama.posterUrl||undefined;
  return {
    title:`${title} | ${ep.drama.title}`,
    description:desc,
    alternates:{canonical:siteUrl(`/watch/${id}`)},
    openGraph:{type:"video.episode",title,description:desc,url:siteUrl(`/watch/${id}`),images:image?[{url:image}]:undefined},
    twitter:{card:"summary_large_image",title,description:desc,images:image?[image]:undefined}
  };
}

export default async function Watch({params}:{params:Promise<{episodeId:string}>}){
  const {episodeId}=await params; const id=Number(episodeId); if(!Number.isInteger(id))notFound();
  const start=await prisma.episode.findFirst({where:{id,status:"PUBLISHED",drama:{status:"PUBLISHED"}},select:{dramaId:true}});
  if(!start)notFound();

  const drama=await prisma.drama.findFirst({
    where:{id:start.dramaId,status:"PUBLISHED"},
    select:{
      title:true,slug:true,posterUrl:true,genre:{select:{name:true,slug:true}},
      episodes:{
        where:{status:"PUBLISHED"},
        orderBy:{number:"asc"},
        select:{id:true,number:true,title:true,description:true,videoUrl:true,hlsUrl:true,thumbnailUrl:true,subtitleUrl:true,duration:true,createdAt:true}
      }
    }
  });
  if(!drama||!drama.episodes.length)notFound();

  const current=drama.episodes.find(e=>e.id===id)!;
  await prisma.episode.update({where:{id},data:{views:{increment:1}}}).catch(()=>{});

  const breadcrumb={
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem",position:1,name:"Home",item:siteUrl("/")},
      {"@type":"ListItem",position:2,name:drama.title,item:siteUrl(`/drama/${drama.slug}`)},
      {"@type":"ListItem",position:3,name:`Episode ${current.number}: ${current.title}`,item:siteUrl(`/watch/${id}`)}
    ]
  };
  const video={
    "@context":"https://schema.org","@type":"VideoObject",
    name:`${drama.title} — Episode ${current.number}: ${current.title}`,
    description:toPlainText(current.description,500)||`Watch ${drama.title} episode ${current.number} free.`,
    thumbnailUrl:current.thumbnailUrl||drama.posterUrl||undefined,
    uploadDate:current.createdAt.toISOString(),
    duration:toIsoDuration(current.duration),
    embedUrl:siteUrl(`/watch/${id}`)
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(breadcrumb)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(video)}}/>
    <ReelsFeed dramaTitle={drama.title} dramaSlug={drama.slug} episodes={drama.episodes} startId={id}/>
  </>;
}
