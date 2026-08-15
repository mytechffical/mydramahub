import SiteHeader from "@/components/SiteHeader";
import SearchClient from "@/components/SearchClient";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <main><SiteHeader /><SearchClient initialQuery={q || ""} /></main>;
}
