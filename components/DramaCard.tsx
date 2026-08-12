import Link from "next/link";

export default function DramaCard({ drama }: { drama: { slug:string; title:string; posterUrl:string|null; genre?:{name:string}|null } }) {
  return <Link href={`/drama/${drama.slug}`} className="card" style={{overflow:"hidden"}}>
    {drama.posterUrl ? <img className="poster" src={drama.posterUrl} alt={drama.title} loading="lazy" /> : <div className="poster" style={{background:"#191919"}} />}
    <div style={{padding:12}}><div style={{fontWeight:900}}>{drama.title}</div><div className="muted" style={{fontSize:12,marginTop:5}}>{drama.genre?.name || "Drama"}</div></div>
  </Link>;
}
