import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReelsFeed from "@/components/ReelsFeed";

export default async function Watch({params}:{params:Promise<{episodeId:string}>}){
  const {episodeId}=await params; const id=Number(episodeId); if(!Number.isInteger(id))notFound();
  const start=await prisma.episode.findFirst({where:{id,status:"PUBLISHED",drama:{status:"PUBLISHED"}},select:{dramaId:true}});
  if(!start)notFound();

  const drama=await prisma.drama.findFirst({
    where:{id:start.dramaId,status:"PUBLISHED"},
    select:{
      title:true,slug:true,
      episodes:{
        where:{status:"PUBLISHED"},
        orderBy:{number:"asc"},
        select:{id:true,number:true,title:true,description:true,videoUrl:true,hlsUrl:true,thumbnailUrl:true,subtitleUrl:true}
      }
    }
  });
  if(!drama||!drama.episodes.length)notFound();

  await prisma.episode.update({where:{id},data:{views:{increment:1}}}).catch(()=>{});

  return <ReelsFeed dramaTitle={drama.title} dramaSlug={drama.slug} episodes={drama.episodes} startId={id}/>;
}
