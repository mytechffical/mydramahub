export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

// Serializes JSON-LD structured data safely for inline <script> tags —
// escaping "<" prevents a title/description containing "</script>" from
// breaking out of the script tag.
export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Converts a duration in seconds to ISO 8601 (e.g. 125 -> "PT2M5S"), the
// format schema.org's VideoObject.duration expects.
export function toIsoDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return undefined;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `PT${m ? `${m}M` : ""}${s || !m ? `${s}S` : ""}`;
}
