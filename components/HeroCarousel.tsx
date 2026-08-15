"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatCount } from "@/lib/format";

export type HeroSlide = {
  slug: string; title: string; description: string;
  posterUrl: string | null; bannerUrl: string | null;
  genreName: string | null; views: number; firstEpisodeId: number | null;
};

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length > 1) timerRef.current = setInterval(() => setIndex(i => (i + 1) % slides.length), 7000);
  };
  useEffect(() => { restartTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [slides.length]);

  if (!slides.length) {
    return (
      <section className="hero-v2">
        <div className="hero-overlay" />
        <div className="container hero-content" style={{ alignItems: "center" }}>
          <div className="hero-info">
            <p className="hero-eyebrow">Free streaming</p>
            <h1 className="hero-title">Watch dramas for free.</h1>
            <p className="hero-desc">Build your library from the admin panel and publish dramas here.</p>
            <div className="hero-actions">
              <Link className="btn-pill" href="/dramas">Browse dramas</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const s = slides[index];
  const bg = s.bannerUrl || s.posterUrl || undefined;
  const goTo = (i: number) => { setIndex(i); restartTimer(); };

  return (
    <section className="hero-v2">
      {bg && <div className="hero-bg" style={{ backgroundImage: `url(${bg})` }} />}
      <div className="hero-overlay" />
      <div className="container hero-content">
        <div className="hero-poster-wrap">
          {s.posterUrl ? <img src={s.posterUrl} alt={s.title} className="hero-poster" fetchPriority="high" loading="eager" /> : <div className="hero-poster" />}
          {s.genreName && <span className="hero-badge">{s.genreName}</span>}
        </div>
        <div className="hero-info">
          <h1 className="hero-title">{s.title}</h1>
          {s.views > 0 && <div className="hero-meta">{formatCount(s.views)} views</div>}
          <p className="hero-desc">{s.description}</p>
          <div className="hero-actions">
            <Link className="btn-pill" href={s.firstEpisodeId ? `/watch/${s.firstEpisodeId}` : `/drama/${s.slug}`}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              Play Now
            </Link>
            <Link className="btn-pill-outline" href={`/drama/${s.slug}`}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M11 10h2v7h-2zm0-4h2v2h-2z" /><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              More info
            </Link>
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button type="button" className="hero-arrow" aria-label="Next featured drama" onClick={() => goTo((index + 1) % slides.length)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="hero-thumbs container">
            {slides.map((sl, i) => (
              <button type="button" key={sl.slug} className={`hero-thumb${i === index ? " active" : ""}`} aria-label={sl.title} onClick={() => goTo(i)}>
                {sl.posterUrl && <img src={sl.posterUrl} alt="" />}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
