"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Genre = { name: string; slug: string };

export default function HeaderNav({ genres }: { genres: Genre[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const genresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!genresOpen) return;
    const onClick = (e: MouseEvent) => {
      if (genresRef.current && !genresRef.current.contains(e.target as Node)) setGenresOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [genresOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="header-logo" onClick={() => setMenuOpen(false)}>
          <span className="header-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
              <path d="M4 26 14 6l4 8 10-8-8 20-4-8-10 8Z" fill="#e50914" />
            </svg>
          </span>
          Drama<span>Hub</span>
        </Link>

        <form action="/search" method="GET" className="header-search" role="search">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M10 2a8 8 0 105.29 14.29l4.7 4.71 1.42-1.42-4.71-4.7A8 8 0 0010 2Zm-6 8a6 6 0 1112 0 6 6 0 01-12 0Z" /></svg>
          <input type="search" name="q" placeholder="Search dramas…" aria-label="Search dramas" />
        </form>

        <nav className="header-nav desktop-only">
          <Link href="/">Home</Link>
          <Link href="/dramas">Dramas</Link>
          <div className="header-genres" ref={genresRef}>
            <button type="button" onClick={() => setGenresOpen(o => !o)} aria-expanded={genresOpen} className="header-genres-btn">
              Genres
              <svg viewBox="0 0 24 24" width="13" height="13" style={{ transform: genresOpen ? "rotate(180deg)" : "none" }} aria-hidden="true"><path fill="currentColor" d="M7 10l5 5 5-5z" /></svg>
            </button>
            {genresOpen && (
              <div className="genres-panel">
                {genres.length ? genres.map(g => (
                  <Link key={g.slug} href={`/dramas?genre=${g.slug}`} onClick={() => setGenresOpen(false)}>{g.name}</Link>
                )) : <span className="muted" style={{ padding: "8px 14px", display: "block" }}>No genres yet</span>}
                <Link href="/genres" className="genres-panel-all" onClick={() => setGenresOpen(false)}>View all genres →</Link>
              </div>
            )}
          </div>
        </nav>

        <button type="button" className="menu-btn" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
          <span style={{ transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-menu" onClick={() => setMenuOpen(false)}>
          <Link href="/">Home</Link>
          <Link href="/dramas">Dramas</Link>
          <Link href="/genres">Genres</Link>
          <Link href="/search">Search</Link>
        </nav>
      )}
    </header>
  );
}
