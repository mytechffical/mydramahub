import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EpisodeForm from "@/components/admin/EpisodeForm";
export default async function NewEpisode({params}:{params:Promise<{id:string}>}){const {id}=await params;const idNum=Number(id);if(!Number.isInteger(idNum))notFound();const drama=await prisma.drama.findUnique({where:{id:idNum}});if(!drama)notFound();return <section className="admin-content"><h1>New Episode — {drama.title}</h1><EpisodeForm dramaId={drama.id}/></section>}
