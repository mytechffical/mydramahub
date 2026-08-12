"use client";
import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="nav">
    <div className="container row" style={{justifyContent:"space-between"}}>
      <Link href="/" className="logo" onClick={()=>setOpen(false)}>Drama<span>Hub</span></Link>
      <nav className="row gap-3 desktop-only">
        <Link href="/dramas">Dramas</Link>
        <Link href="/genres">Genres</Link>
        <Link href="/search">Search</Link>
      </nav>
      <button type="button" className="menu-btn" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} onClick={()=>setOpen(o=>!o)}>
        <span style={{transform:open?"translateY(6px) rotate(45deg)":"none"}}/>
        <span style={{opacity:open?0:1}}/>
        <span style={{transform:open?"translateY(-6px) rotate(-45deg)":"none"}}/>
      </button>
    </div>
    {open && <nav className="mobile-menu" onClick={()=>setOpen(false)}>
      <Link href="/dramas">Dramas</Link>
      <Link href="/genres">Genres</Link>
      <Link href="/search">Search</Link>
    </nav>}
  </header>;
}
