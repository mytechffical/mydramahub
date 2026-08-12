import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EpisodeForm from "@/components/admin/EpisodeForm";
export default async function EditEpisode({params}:{params:Promise<{id:string}>}){const {id}=await params;const idNum=Number(id);if(!Number.isInteger(idNum))notFound();const e=await prisma.episode.findUnique({where:{id:idNum},include:{drama:true}});if(!e)notFound();return <section className="admin-content"><h1>Edit Episode — {e.drama.title}</h1><EpisodeForm dramaId={e.dramaId} episode={e}/></section>}
