"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Result = { id: number; slug: string; title: string; posterUrl: string | null; genre: { name: string } | null };

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [q, setQ] = useState(initialQuery);
  const [items, setItems] = useState<Result[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setItems([]); setSearched(false); return; }
      const r = await fetch(`/api/public/search?q=${encodeURIComponent(q)}`);
      if (r.ok) setItems(await r.json());
      setSearched(true);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <section className="container" style={{ padding: "35px 0 60px" }}>
      <h1>Search</h1>
      <input className="input" placeholder="Search dramas…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 600 }} autoFocus />
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 14, marginTop: 20 }}>
        {items.map(d => (
          <Link key={d.id} href={`/drama/${d.slug}`} className="card" style={{ overflow: "hidden" }}>
            {d.posterUrl ? <img className="poster" src={d.posterUrl} alt={d.title} /> : <div className="poster" />}
            <div style={{ padding: 12, fontWeight: 900 }}>{d.title}</div>
          </Link>
        ))}
      </div>
      {searched && !items.length && <p className="muted" style={{ marginTop: 20 }}>No dramas found for "{q}".</p>}
    </section>
  );
}
