import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "DramaHub — Free Drama Streaming", template: "%s | DramaHub" },
  description: "Watch dramas and episodes online for free.",
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: "DramaHub", title: "DramaHub — Free Drama Streaming", description: "Watch dramas and episodes online for free." }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
