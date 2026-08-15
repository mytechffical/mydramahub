import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "DramaHub — Free Drama Streaming", template: "%s | DramaHub" },
  description: "Watch dramas and episodes online for free.",
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl("/") },
  openGraph: {
    type: "website",
    siteName: "DramaHub",
    title: "DramaHub — Free Drama Streaming",
    description: "Watch dramas and episodes online for free.",
    url: siteUrl("/"),
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "DramaHub — Free Drama Streaming",
    description: "Watch dramas and episodes online for free."
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050505"
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("dh-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><head><script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /></head><body>{children}</body></html>;
}
