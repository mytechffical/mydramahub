import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dramas, genres] = await Promise.all([
    prisma.drama.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, episodes: { where: { status: "PUBLISHED" }, select: { id: true, updatedAt: true } } }
    }),
    prisma.genre.findMany({ where: { dramas: { some: { status: "PUBLISHED" } } }, select: { slug: true, updatedAt: true } })
  ]);

  return [
    { url: siteUrl("/"), priority: 1, changeFrequency: "daily" },
    { url: siteUrl("/dramas"), priority: .9, changeFrequency: "daily" },
    { url: siteUrl("/genres"), priority: .6, changeFrequency: "weekly" },
    ...genres.map(g => ({ url: siteUrl(`/dramas?genre=${g.slug}`), lastModified: g.updatedAt, priority: .6, changeFrequency: "weekly" as const })),
    ...dramas.map(d => ({ url: siteUrl(`/drama/${d.slug}`), lastModified: d.updatedAt, priority: .8, changeFrequency: "weekly" as const })),
    ...dramas.flatMap(d => d.episodes.map(e => ({ url: siteUrl(`/watch/${e.id}`), lastModified: e.updatedAt, priority: .5, changeFrequency: "monthly" as const })))
  ];
}
