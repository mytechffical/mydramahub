import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SearchClient from "@/components/SearchClient";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for dramas on DramaHub.",
  alternates: { canonical: siteUrl("/search") },
  robots: { index: false, follow: true }
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <main><SiteHeader /><SearchClient initialQuery={q || ""} /></main>;
}
