import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 12) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD. Password must be at least 12 characters.");
  process.exit(1);
}

await prisma.adminUser.upsert({
  where: { email },
  update: { passwordHash: hashPassword(password), active: true },
  create: { email, passwordHash: hashPassword(password), active: true }
});

console.log(`Admin ready: ${email}`);
await prisma.$disconnect();
