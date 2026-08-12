import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dramas = await prisma.drama.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
  return [
    { url: siteUrl("/"), priority: 1, changeFrequency: "daily" },
    { url: siteUrl("/dramas"), priority: .9, changeFrequency: "daily" },
    ...dramas.map(d => ({ url: siteUrl(`/drama/${d.slug}`), lastModified: d.updatedAt, priority: .8, changeFrequency: "weekly" as const }))
  ];
}
