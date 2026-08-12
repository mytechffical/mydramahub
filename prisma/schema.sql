-- DramaHub schema, hand-translated from prisma/schema.prisma.
-- Use this ONLY if you can't run `npx prisma db push` (e.g. no local Node.js
-- at all). Paste this whole file into your database provider's SQL console
-- (Neon, Supabase, phpPgAdmin, Adminer, etc.) and run it once, against an
-- EMPTY database. It creates exactly the tables/columns/indexes Prisma would.

CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "ProcessingStatus" AS ENUM ('NONE', 'QUEUED', 'PROCESSING', 'READY', 'FAILED');

CREATE TABLE "AdminUser" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

CREATE TABLE "AdminSession" (
    "id" SERIAL PRIMARY KEY,
    "adminId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId")
        REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_adminId_idx" ON "AdminSession"("adminId");
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

CREATE TABLE "Genre" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

CREATE TABLE "Drama" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "posterUrl" TEXT,
    "bannerUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "genreId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Drama_genreId_fkey" FOREIGN KEY ("genreId")
        REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Drama_slug_key" ON "Drama"("slug");
CREATE INDEX "Drama_status_featured_idx" ON "Drama"("status", "featured");
CREATE INDEX "Drama_genreId_idx" ON "Drama"("genreId");

CREATE TABLE "Episode" (
    "id" SERIAL PRIMARY KEY,
    "dramaId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoUrl" TEXT,
    "hlsUrl" TEXT,
    "thumbnailUrl" TEXT,
    "subtitleUrl" TEXT,
    "duration" INTEGER,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'NONE',
    "processingError" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Episode_dramaId_fkey" FOREIGN KEY ("dramaId")
        REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Episode_dramaId_number_key" ON "Episode"("dramaId", "number");
CREATE INDEX "Episode_dramaId_status_number_idx" ON "Episode"("dramaId", "status", "number");
CREATE INDEX "Episode_status_updatedAt_idx" ON "Episode"("status", "updatedAt");
