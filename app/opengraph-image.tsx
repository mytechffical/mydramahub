import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 70% 30%, #3a1111, #050505 60%)",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#111111" />
            <path d="M6 26 15 6l3.5 8L28 6l-9 20-3.5-8L6 26Z" fill="#e50914" />
          </svg>
          <div style={{ display: "flex", color: "#fff", fontSize: 84, fontWeight: 900 }}>
            Drama<span style={{ color: "#e50914" }}>Hub</span>
          </div>
        </div>
        <div style={{ display: "flex", color: "#c9c9c9", fontSize: 28, marginTop: 22, fontWeight: 600 }}>
          Watch dramas and episodes online for free
        </div>
      </div>
    ),
    { ...size }
  );
}
