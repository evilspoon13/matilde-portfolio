# matildecrisp.com

Portfolio site for Matilde Crisp. Next.js App Router, with a small
password-gated CMS at `/admin`.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Database | Neon Postgres via Drizzle ORM |
| File storage | Cloudflare R2, S3-compatible API |
| Styling | Tailwind v4, a few shadcn/ui primitives |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.example .env    # then fill it in
npm run db:push         # create the tables
npm run dev             # http://localhost:3000
```

Every variable in `.env.example` is documented there, including the R2 CORS
rule the browser uploads depend on. All of them must also be set in Vercel —
note that `DATABASE_URL` is needed in the **build** environment too, because
`/works/[id]` queries the database while prerendering.

## How content works

`/admin` is gated by a single shared password (`ADMIN_PASSWORD`) and a signed
cookie. It edits four collections:

- **About** — name, job title, headline statement, bio, skills, résumé PDF,
  background image, and the external link to the portfolio book
- **Education** and **Experience** — list entries, drag to reorder
- **Works** — projects, drag to reorder, each with an image gallery and an
  optional PDF

Saving calls `revalidateTag`, so changes appear on the public site immediately
rather than waiting out the ISR window.

### Images

Uploads are resized in the browser (`src/lib/image-resize.ts`) to 2400px WebP
before a presigned `PUT` straight to R2 — Vercel caps request bodies at 4.5MB,
so large originals can never go through a route handler. The database stores
object **keys**, never URLs, so the delivery domain can change without a data
migration.

## Layout

```
src/app/(site)      public pages: /, /works, /works/[id], /portfolio
src/app/(admin)     /admin — its own layout, no site chrome, force-dynamic
src/db              Drizzle schema and client
src/lib/content.ts  the read side: getAbout, getWorks, getWorkById, …
src/lib/storage.ts  R2: presign, put, delete
src/lib/auth.ts     session cookie (Web Crypto, works in Edge middleware)
scripts/            one-off migration from the original Notion setup
```

`requireAdmin()` is the security boundary, not the middleware — a server action
is a POST to whatever route the browser is on, so the matcher does not
necessarily see it. Every mutating action calls it first.

## Scripts

```bash
npm run dev          npm run build         npm run start
npm run typecheck    npm run db:push       npm run db:studio
```
