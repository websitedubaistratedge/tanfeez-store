# TANFEEZ: Website, E‑Store & Admin

Next.js 16 · React 19 · Tailwind 4 · Framer Motion · Lenis · Cloudflare Workers (D1 + KV)

## Run it
```bash
npm install
npm run dev        # http://localhost:3300
```
- Store: `/` · `/shop` · `/inspiration` · `/business` · `/projects` · `/services` · `/about` · `/contact` · `/quote` · `/track`
- Admin: `/admin`. Locally the demo password is `tanfeez-admin`; a deployed site only accepts the `ADMIN_PASSWORD` secret
- Language: EN / العربية toggle in the navbar (full RTL)

## Data
Everything is stored in **Cloudflare D1** (`lib/db.ts`): one JSON row per product, project, order,
request and message, plus settings/counters. The tables are created and filled from `data/seed.json`
on the first request. `npm run dev` uses a local D1 copy in `.wrangler/state`.
- Rebuild the seed from the source content: `npm run seed`
- Reset the data: **Admin → Settings → Reset demo data**
- Uploaded images and briefs are stored in **Workers KV** and served from `/api/uploads/*`
- Query the live database: `npx wrangler d1 execute tanfeez-db --remote --command "SELECT coll, COUNT(*) FROM docs GROUP BY coll"`

## Deploy (Cloudflare Workers, free plan)
Bindings live in `wrangler.jsonc` (D1 `tanfeez-db`, KV `tanfeez-uploads`).
- Cloudflare Workers Builds is connected to this repo: build command `npx opennextjs-cloudflare build`,
  deploy command `npx opennextjs-cloudflare deploy`. Every push to `main` redeploys.
- Set **`ADMIN_PASSWORD`** as a secret on the Worker (Settings → Variables and secrets). Until it is set,
  admin login is disabled on the live site. Optional: `SESSION_SECRET` (otherwise derived from the password).
- Local production check: `npm run preview` (runs the Worker in workerd on your machine).
- Images are served as-is from the CDN (`images.unoptimized`), so keep new uploads web-sized (≤ 2400px).

## Assets
All logos and photos were extracted from *TANFEEZ Company Profile 2024* (`public/brand`, `public/images`).
The logo mark was vectorised (`public/brand/mark.svg`).
