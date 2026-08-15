import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import DramaCard from "@/components/DramaCard";
import HeroCarousel, { HeroSlide } from "@/components/HeroCarousel";
import { description as toPlainText } from "@/lib/html";
import { siteUrl, safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: siteUrl("/") }
};

export default async function Home() {
  const [heroDramas, latest] = await Promise.all([
    prisma.drama.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: 5,
      include: {
        genre: true,
        episodes: { where: { status: "PUBLISHED" }, orderBy: { number: "asc" }, select: { id: true, views: true } }
      }
    }),
    prisma.drama.findMany({ where: { status: "PUBLISHED" }, include: { genre: true }, orderBy: { updatedAt: "desc" }, take: 12 })
  ]);

  const slides: HeroSlide[] = heroDramas.map(d => ({
    slug: d.slug,
    title: d.title,
    description: toPlainText(d.description, 200),
    posterUrl: d.posterUrl,
    bannerUrl: d.bannerUrl,
    genreName: d.genre?.name || null,
    views: d.episodes.reduce((sum, e) => sum + e.views, 0),
    firstEpisodeId: d.episodes[0]?.id ?? null
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DramaHub",
    url: siteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: siteUrl("/search?q={search_term_string}") },
      "query-input": "required name=search_term_string"
    }
  };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
    <SiteHeader />
    <HeroCarousel slides={slides} />
    <section className="container" style={{ padding: "clamp(16px,5vw,35px) 0 60px" }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}><h2 style={{ margin: 0 }}>Latest dramas</h2><Link className="muted" href="/dramas">View all →</Link></div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 14 }}>{latest.map(d => <DramaCard key={d.id} drama={d} />)}</div>
      {!latest.length && <p className="muted">No dramas published yet — add some from the admin panel.</p>}
    </section>
  </main>;
}
