import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const { ok } = rateLimit(`view:${ip}`, 60, 60_000);
  if (!ok) return NextResponse.json({ ok: false }, { status: 429 });

  const body = await req.json().catch(() => null);
  const id = Number(body?.episodeId);
  if (!Number.isInteger(id)) return NextResponse.json({ ok: false }, { status: 400 });

  await prisma.episode.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
