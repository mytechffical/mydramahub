# DramaHub Complete — cleaned and integrated build

This ZIP is a fresh, integrated project rather than a concatenation of the earlier phase snippets.

## Included
- Free public streaming website
- Home, dramas, genres, search
- Drama detail pages
- Episode watch pages
- HLS.js + native HLS + MP4 fallback
- VTT subtitle support
- Watch progress in localStorage
- Episode previous/next navigation
- View counter
- SEO metadata, robots and sitemap
- Classic content editor
- Admin login with scrypt password hashing
- HTTP-only session cookies
- Login rate limiting
- Protected admin CMS
- Drama CRUD
- Episode CRUD
- Genre creation
- HLS processing queue state
- Server-side HTML sanitization
- Database indexes and cascading relations
- No subscription, payment, membership or paywall

## Requirements
Node.js 20.9+ is recommended for Next.js 16.
PostgreSQL is required.

## Setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`.
3. Set `NEXT_PUBLIC_SITE_URL`.
4. Install:
   npm install
5. Generate Prisma:
   npm run db:generate
6. Create tables:
   npm run db:push
   (or use `npm run db:migrate` for migration history)
7. Seed demo content:
   npm run db:seed
8. Create an admin:
   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='a-long-random-password' npm run admin:create
9. Start:
   npm run dev

Open:
- Public site: http://localhost:3000
- Admin: http://localhost:3000/login

## Video
For an episode, enter either:
- direct MP4/WebM `videoUrl`, or
- HLS `.m3u8` `hlsUrl`

The player uses native HLS where available and HLS.js elsewhere.

For real adaptive streaming, a separate FFmpeg worker should generate HLS renditions and update `hlsUrl`. The queue endpoint only records `QUEUED`; it does not fake a completed transcode.

## Before production
- Use object storage + CDN for media.
- Add a real shared rate limiter (Redis/edge) instead of the in-memory development limiter.
- Add CSRF protection for cookie-authenticated mutations.
- Add audit logs and admin session management.
- Validate media MIME type, file size and URL allowlists.
- Replace the simple HTML sanitizer with a maintained sanitizer such as DOMPurify/isomorphic-dompurify.
- Add a background FFmpeg queue/worker.
- Use signed media URLs if your licensing model requires them.
- Add backups and database monitoring.

## Why this replaces the phase ZIPs
The earlier phase files were incremental snippets and several had conflicting schemas, duplicate layouts, missing dependencies, or were not a runnable whole. This project resolves those conflicts into one consistent application.
