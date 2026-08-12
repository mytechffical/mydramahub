"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";

type Result={id:number;slug:string;title:string;posterUrl:string|null;genre:{name:string}|null};
export default function SearchPage(){
  const [q,setQ]=useState(""); const [items,setItems]=useState<Result[]>([]);
  useEffect(()=>{const t=setTimeout(async()=>{if(!q.trim()){setItems([]);return} const r=await fetch(`/api/public/search?q=${encodeURIComponent(q)}`); if(r.ok)setItems(await r.json())},250);return()=>clearTimeout(t)},[q]);
  return <main><SiteHeader/><section className="container" style={{padding:"35px 0 60px"}}><h1>Search</h1><input className="input" placeholder="Search dramas…" value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:600}}/><div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14,marginTop:20}}>{items.map(d=><Link key={d.id} href={`/drama/${d.slug}`} className="card" style={{overflow:"hidden"}}>{d.posterUrl?<img className="poster" src={d.posterUrl} alt={d.title}/>:<div className="poster"/>}<div style={{padding:12,fontWeight:900}}>{d.title}</div></Link>)}</div></section></main>;
}
