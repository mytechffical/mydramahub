import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import DramaCard from "@/components/DramaCard";
import { siteUrl, safeJsonLd } from "@/lib/seo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ genre?: string }> }): Promise<Metadata> {
  const { genre } = await searchParams;
  if (genre) {
    const g = await prisma.genre.findUnique({ where: { slug: genre }, select: { name: true } });
    if (g) return {
      title: `${g.name} Dramas`,
      description: `Browse free ${g.name.toLowerCase()} dramas — new episodes added regularly.`,
      alternates: { canonical: siteUrl(`/dramas?genre=${genre}`) }
    };
  }
  return { title: "Browse Dramas", description: "Browse the full catalog of dramas available to watch for free.", alternates: { canonical: siteUrl("/dramas") } };
}

export default async function Dramas({ searchParams }: { searchParams: Promise<{genre?:string}> }) {
  const { genre } = await searchParams;
  const [dramas, genreRow] = await Promise.all([
    prisma.drama.findMany({
      where:{status:"PUBLISHED", ...(genre ? {genre:{slug:genre}}:{})},
      include:{genre:true},
      orderBy:{updatedAt:"desc"}
    }),
    genre ? prisma.genre.findUnique({ where: { slug: genre }, select: { name: true } }) : Promise.resolve(null)
  ]);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: genreRow ? `${genreRow.name} Dramas` : "Dramas", item: siteUrl(genre ? `/dramas?genre=${genre}` : "/dramas") }
    ]
  };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumb) }} />
    <SiteHeader/>
    <section className="container" style={{padding:"35px 0 60px"}}>
      <h1>{genreRow ? `${genreRow.name} Dramas` : "Dramas"}</h1>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14}}>{dramas.map(d=><DramaCard key={d.id} drama={d}/>)}</div>
      {!dramas.length&&<p className="muted">No dramas found.</p>}
    </section>
  </main>;
}
