import { prisma } from "@/lib/prisma";
import DramaForm from "@/components/admin/DramaForm";
export default async function NewDrama(){const genres=await prisma.genre.findMany({orderBy:{name:"asc"}});return <section className="admin-content"><h1>New Drama</h1><DramaForm genres={genres} /></section>}
