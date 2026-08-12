"use client";
import { useEffect, useRef, useState } from "react";

export default function AdaptivePlayer({hlsUrl,fallbackUrl,poster,subtitleUrl,episodeId}:{hlsUrl?:string|null;fallbackUrl?:string|null;poster?:string|null;subtitleUrl?:string|null;episodeId:number}){
  const ref=useRef<HTMLVideoElement>(null); const [error,setError]=useState("");
  useEffect(()=>{
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
  },[hlsUrl,fallbackUrl,episodeId]);
  return <div style={{position:"relative"}}><video ref={ref} controls playsInline preload="metadata" poster={poster||undefined} className="video">{subtitleUrl&&<track kind="subtitles" src={subtitleUrl} srcLang="en" label="English" default/>}</video>{error&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",background:"rgba(0,0,0,.8)",padding:20,textAlign:"center"}}>{error}</div>}</div>;
}
