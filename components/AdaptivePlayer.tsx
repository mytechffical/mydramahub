"use client";
import { useEffect, useRef, useState } from "react";

// A URL counts as a direct playable file only if it points at an actual
// media file. Anything else (ok.ru, YouTube, Vimeo, Dailymotion links, etc.)
// is an embed page meant to sit inside an <iframe>, not a <video src>.
function isDirectFileUrl(url: string) {
  return /\.(mp4|webm|mov|m3u8)(\?.*)?$/i.test(url);
}

// Normalize a few common share-link formats into their embeddable form,
// so pasting the regular "watch" link still works.
function toEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.pathname === "/watch" && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com") && !u.pathname.includes("/embed/")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (u.hostname.includes("ok.ru") && u.pathname.startsWith("/video/")) {
      return url.replace("/video/", "/videoembed/");
    }
    return url;
  } catch {
    return url;
  }
}

export default function AdaptivePlayer({hlsUrl,fallbackUrl,poster,subtitleUrl,episodeId}:{hlsUrl?:string|null;fallbackUrl?:string|null;poster?:string|null;subtitleUrl?:string|null;episodeId:number}){
  const ref=useRef<HTMLVideoElement>(null); const [error,setError]=useState("");

  // If there's no direct/HLS file, but there is a fallback URL, treat it as
  // an embed and render it in an iframe instead of the <video> element.
  const useEmbed = !hlsUrl && !!fallbackUrl && !isDirectFileUrl(fallbackUrl);

  useEffect(()=>{
    if(useEmbed) return;
    let hls:any; let cancelled=false; const v=ref.current; if(!v)return;
    setError("");

    // Restore saved progress only once the attached source actually has metadata,
    // otherwise currentTime gets set before there's anything to seek within (lost
    // especially on the hls.js path, since attaching happens after an async import).
    const key=`dh-progress-${episodeId}`;
    const restore=()=>{const saved=Number(localStorage.getItem(key)||0);if(saved>5)v.currentTime=saved};
    const save=()=>localStorage.setItem(key,String(Math.floor(v.currentTime)));
    v.addEventListener("loadedmetadata",restore,{once:true});
    v.addEventListener("timeupdate",save);

    (async()=>{
      try{
        if(hlsUrl && v.canPlayType("application/vnd.apple.mpegurl")) v.src=hlsUrl;
        else if(hlsUrl){
          const {default:Hls}=await import("hls.js");
          if(cancelled)return;
          if(Hls.isSupported()){hls=new Hls({enableWorker:true});hls.loadSource(hlsUrl);hls.attachMedia(v);hls.on(Hls.Events.ERROR,(_:any,data:any)=>{if(data?.fatal)setError("Stream unavailable.")})}
          else if(fallbackUrl)v.src=fallbackUrl; else setError("Browser cannot play this stream.");
        } else if(fallbackUrl)v.src=fallbackUrl; else setError("Video is not available yet.");
      }catch{if(!cancelled){if(fallbackUrl)v.src=fallbackUrl;else setError("Video could not be loaded.")}}
    })();
    return()=>{
      cancelled=true;
      v.removeEventListener("loadedmetadata",restore);
      v.removeEventListener("timeupdate",save);
      hls?.destroy();
    };
  },[hlsUrl,fallbackUrl,episodeId,useEmbed]);

  if (useEmbed) {
    return <div style={{position:"relative",aspectRatio:"16/9"}}>
      <iframe
        src={toEmbedUrl(fallbackUrl!)}
        style={{position:"absolute",inset:0,width:"100%",height:"100%",border:0}}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
      />
    </div>;
  }

  return <div style={{position:"relative"}}><video ref={ref} controls playsInline preload="metadata" poster={poster||undefined} className="video">{subtitleUrl&&<track kind="subtitles" src={subtitleUrl} srcLang="en" label="English" default/>}</video>{error&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",background:"rgba(0,0,0,.8)",padding:20,textAlign:"center"}}>{error}</div>}</div>;
}
