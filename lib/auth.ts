import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "dramahub_admin_session";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getAdmin() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: { admin: true }
  });

  if (!session || session.expiresAt <= new Date() || !session.admin.active) {
    if (session) await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.admin;
}

export async function getAdminId() {
  return (await getAdmin())?.id ?? null;
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function createAdminSession(adminId: number) {
  const raw = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);

  await prisma.adminSession.deleteMany({
    where: { adminId, expiresAt: { lt: new Date() } }
  });

  await prisma.adminSession.create({
    data: { adminId, tokenHash: hashToken(raw), expiresAt }
  });

  const store = await cookies();
  store.set(COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (raw) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(raw) } });
  store.delete(COOKIE);
}
