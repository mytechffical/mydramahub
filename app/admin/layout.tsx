import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth";
import Nav from "@/components/admin/Nav";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({children}:{children:React.ReactNode}){
  // Auth is checked here, server-side, before any nested admin page ever runs.
  // Nested pages are Server Components that query Prisma directly for admin
  // data (drafts included) — if we only gated rendering on the client, that
  // data would already be fetched and sent to the browser regardless of what
  // the client chooses to display. redirect() aborts the render before any
  // child page component executes, so unauthenticated requests never trigger
  // those queries at all.
  const admin = await getAdmin();
  if (!admin) redirect("/login");

  return <div className="admin-shell"><Nav email={admin.email}/><main className="admin-main">{children}</main></div>;
}
