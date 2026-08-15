"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { sanitizeHtml } from "@/lib/html";

type Ep = {
  id: number; number: number; title: string; description: string;
  videoUrl: string | null; hlsUrl: string | null; thumbnailUrl: string | null; subtitleUrl: string | null;
};

function getEmbedUrl(ep: Ep) {
  return ep.videoUrl || ep.hlsUrl || "";
}

export default function ReelsFeed({ dramaTitle, dramaSlug, episodes, startId }:
  { dramaTitle: string; dramaSlug: string; episodes: Ep[]; startId: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [activeId, setActiveId] = useState(startId);
  const [muted, setMuted] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [embedIds, setEmbedIds] = useState<Set<number>>(new Set());
  const countedViews = useRef<Set<number>>(new Set([startId]));

  // Scroll instantly to the requested episode on first load, without a smooth animation.
  useLayoutEffect(() => {
    const el = slideRefs.current.get(startId);
    if (el) el.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      let best: { id: number; ratio: number } | null = null;
      for (const entry of entries) {
        const id = Number((entry.target as HTMLElement).dataset.epId);
        if (entry.intersectionRatio >= 0.6 && (!best || entry.intersectionRatio > best.ratio)) {
          best = { id, ratio: entry.intersectionRatio };
        }
      }
      if (best) setActiveId(best.id);
    }, { root, threshold: [0, 0.6, 1] });
    slideRefs.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [episodes]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onScroll = () => setShowHint(false);
    root.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ep = episodes.find(e => e.id === activeId);
    if (!ep) return;
    window.history.replaceState(null, "", `/watch/${activeId}`);
    document.title = `Episode ${ep.number}: ${ep.title} | ${dramaTitle}`;
    if (!countedViews.current.has(activeId)) {
      countedViews.current.add(activeId);
      fetch("/api/public/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ episodeId: activeId }) }).catch(() => {});
    }
  }, [activeId, episodes, dramaTitle]);

  const registerSlide = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) slideRefs.current.set(id, el);
    else slideRefs.current.delete(id);
  }, []);

  const markAsEmbed = useCallback((id: number) => {
    setEmbedIds(prev => { if (prev.has(id)) return prev; const next = new Set(prev); next.add(id); return next; });
  }, []);

  const activeIndex = episodes.findIndex(e => e.id === activeId);
  const hasNext = activeIndex >= 0 && activeIndex < episodes.length - 1;
  const activeIsEmbed = embedIds.has(activeId);

  const goTo = (id: number) => {
    const el = slideRefs.current.get(id);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <div className="reels" ref={containerRef}>
      <div className="reel-top">
        <Link href={`/drama/${dramaSlug}`} className="reel-back" aria-label="Back to drama">←</Link>
        {!activeIsEmbed && (
          <button type="button" className="reel-mute" onClick={() => setMuted(m => !m)} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🔊"}
          </button>
        )}
      </div>
      {episodes.map(ep => (
        <ReelSlide
          key={ep.id}
          ep={ep}
          dramaTitle={dramaTitle}
          dramaSlug={dramaSlug}
          episodes={episodes}
          isActive={ep.id === activeId}
          muted={muted}
          registerSlide={registerSlide}
          onSelectEpisode={goTo}
          showHint={showHint && ep.id === activeId && hasNext}
          isEmbed={embedIds.has(ep.id)}
          markAsEmbed={markAsEmbed}
        />
      ))}
    </div>
  );
}

function ReelSlide({ ep, dramaTitle, dramaSlug, episodes, isActive, muted, registerSlide, onSelectEpisode, showHint, isEmbed, markAsEmbed }:
  {
    ep: Ep; dramaTitle: string; dramaSlug: string; episodes: Ep[];
    isActive: boolean; muted: boolean;
    registerSlide: (id: number, el: HTMLDivElement | null) => void;
    onSelectEpisode: (id: number) => void; showHint: boolean;
    isEmbed: boolean; markAsEmbed: (id: number) => void;
  }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const attachedRef = useRef(false);
  const hlsRef = useRef<any>(null);
  const [paused, setPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(!ep.videoUrl && !ep.hlsUrl ? "Video is not available yet." : "");
  // Once we've shown the iframe fallback for this slide at least once, keep it mounted so
  // scrolling back to it doesn't reload the third-party player from scratch.
  const [embedLoaded, setEmbedLoaded] = useState(false);
  useEffect(() => { if (isActive && isEmbed) setEmbedLoaded(true); }, [isActive, isEmbed]);

  // Try to play the link as a real video first — this is exactly how it worked before the
  // reels update, so anything that played then still plays the same way now. Only links that
  // truly are third-party embed pages (not real video files) will fail here and fall back
  // to the iframe box below.
  useEffect(() => {
    if (isEmbed) return;
    if (!ep.videoUrl && !ep.hlsUrl) return;
    if (!isActive || attachedRef.current) return;
    attachedRef.current = true;
    const v = videoRef.current;
    if (!v) return;
    let cancelled = false;
    const key = `dh-progress-${ep.id}`;
    const restore = () => { const saved = Number(localStorage.getItem(key) || 0); if (saved > 5 && saved < (v.duration - 5)) v.currentTime = saved; };
    const save = () => { localStorage.setItem(key, String(Math.floor(v.currentTime))); if (v.duration) setProgress((v.currentTime / v.duration) * 100); };
    const onVideoError = () => {
      if (cancelled) return;
      // The link isn't a directly playable video file — fall back to showing it in an iframe.
      hlsRef.current?.destroy();
      markAsEmbed(ep.id);
    };
    v.addEventListener("loadedmetadata", restore, { once: true });
    v.addEventListener("timeupdate", save);
    v.addEventListener("error", onVideoError);
    (async () => {
      try {
        if (ep.hlsUrl && v.canPlayType("application/vnd.apple.mpegurl")) v.src = ep.hlsUrl;
        else if (ep.hlsUrl) {
          const { default: Hls } = await import("hls.js");
          if (cancelled) return;
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;
            hls.loadSource(ep.hlsUrl);
            hls.attachMedia(v);
            hls.on(Hls.Events.ERROR, (_: any, data: any) => { if (data?.fatal) { hls.destroy(); markAsEmbed(ep.id); } });
          } else if (ep.videoUrl) v.src = ep.videoUrl; else onVideoError();
        } else if (ep.videoUrl) v.src = ep.videoUrl; else onVideoError();
      } catch { if (!cancelled) { if (ep.videoUrl && v.src !== ep.videoUrl) v.src = ep.videoUrl; else onVideoError(); } }
    })();
    return () => { cancelled = true; };
  }, [isActive, ep, isEmbed, markAsEmbed]);

  // Only tear the stream down when this slide truly unmounts (leaving the watch page),
  // not on every active/inactive toggle while scrolling.
  useEffect(() => {
    const v = videoRef.current;
    return () => { hlsRef.current?.destroy(); if (v) v.src = ""; };
  }, []);

  // Play/pause as this slide becomes the active one while scrolling, like a reels feed.
  useEffect(() => {
    if (isEmbed) return;
    const v = videoRef.current;
    if (!v) return;
    if (isActive) { v.play().then(() => setPaused(false)).catch(() => setPaused(true)); }
    else { v.pause(); setPaused(true); }
  }, [isActive, isEmbed]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  const togglePlay = () => {
    if (isEmbed) return;
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().then(() => setPaused(false)).catch(() => {}); }
    else { v.pause(); setPaused(true); }
  };

  return (
    <div className="reel-slide" data-ep-id={ep.id} ref={(el) => { wrapRef.current = el; registerSlide(ep.id, el); }}>
      {!isEmbed && (ep.videoUrl || ep.hlsUrl) && (
        <>
          <div className="reel-progress"><div className="reel-progress-bar" style={{ width: `${progress}%` }} /></div>
          <video
            ref={videoRef}
            className="reel-video"
            playsInline
            muted={muted}
            loop={false}
            preload="none"
            poster={ep.thumbnailUrl || undefined}
            onClick={togglePlay}
            onEnded={() => { const next = episodes[episodes.findIndex(e => e.id === ep.id) + 1]; if (next) onSelectEpisode(next.id); }}
          >
            {ep.subtitleUrl && <track kind="subtitles" src={ep.subtitleUrl} srcLang="en" label="English" default />}
          </video>
          {paused && isActive && !error && (
            <button type="button" className="reel-center-play" onClick={togglePlay} aria-label="Play">
              <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            </button>
          )}
        </>
      )}
      {isEmbed && (
        embedLoaded ? (
          <iframe
            src={isActive ? getEmbedUrl(ep) : undefined}
            className="reel-video"
            style={{ border: 0 }}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        ) : (
          ep.thumbnailUrl
            ? <img src={ep.thumbnailUrl} alt="" className="reel-video" style={{ objectFit: "cover" }} />
            : <div className="reel-video" />
        )
      )}
      {error && !isEmbed && <div className="reel-center-play" style={{ color: "#fff", fontWeight: 700, textAlign: "center", padding: 20 }}>{error}</div>}
      {showHint && <div className="reel-hint"><span style={{ fontSize: 20 }}>↑</span>Next episode</div>}
      <div className="reel-bottom">
        <Link href={`/drama/${dramaSlug}`} className="reel-drama-link">{dramaTitle}</Link>
        <div className="reel-title">Episode {ep.number}: {ep.title}</div>
        <div className="reel-desc" dangerouslySetInnerHTML={{ __html: sanitizeHtml(ep.description) }} />
        <div className="reel-ep-pills">
          {episodes.map(e => (
            <button key={e.id} type="button" className={`reel-ep-pill${e.id === ep.id ? " active" : ""}`} onClick={() => onSelectEpisode(e.id)}>
              {e.number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
