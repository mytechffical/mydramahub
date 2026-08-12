import { PrismaClient, PublishStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const romance = await prisma.genre.upsert({
    where: { slug: "romance" },
    update: {},
    create: { name: "Romance", slug: "romance" }
  });

  const drama = await prisma.drama.upsert({
    where: { slug: "demo-drama" },
    update: {},
    create: {
      title: "Demo Drama",
      slug: "demo-drama",
      description: "<p>A sample drama created by the seed script.</p>",
      genreId: romance.id,
      status: PublishStatus.PUBLISHED,
      featured: true
    }
  });

  await prisma.episode.upsert({
    where: { dramaId_number: { dramaId: drama.id, number: 1 } },
    update: {},
    create: {
      dramaId: drama.id,
      number: 1,
      title: "Episode 1",
      description: "<p>Sample episode. Add your own video URL in the admin panel.</p>",
      status: PublishStatus.PUBLISHED
    }
  });

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    await prisma.adminUser.upsert({
      where: { email: email.toLowerCase() },
      update: { passwordHash: hashPassword(password), active: true },
      create: { email: email.toLowerCase(), passwordHash: hashPassword(password), active: true }
    });
  }

  console.log("Database seeded.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
