# TANFEEZ: Website, E‑Store & Admin

Next.js 16 · React 19 · Tailwind 4 · Framer Motion · React Three Fiber · Lenis

## Run it
```bash
npm install
npm run dev        # http://localhost:3300
```
- Store: `/` · `/shop` · `/projects` · `/services` · `/about` · `/contact` · `/quote` · `/track`
- Admin: `/admin`, password in `.env.local` (`ADMIN_PASSWORD`, demo: `tanfeez-admin`)
- Language: EN / العربية toggle in the navbar (full RTL)

## Data
Demo data lives in `data/db.json` (created from `data/seed.json` on first run).
- Rebuild the seed from the source content: `npm run seed`
- Reset the live demo: **Admin → Settings → Reset demo data**, or delete `data/db.json`
- Uploaded images are stored in `data/uploads/` and served from `/api/uploads/*`

`lib/db.ts` is the only persistence module, so it can be swapped for Postgres/Prisma for production.

## Assets
All logos and photos were extracted from *TANFEEZ Company Profile 2024* (`public/brand`, `public/images`).
The logo mark was vectorised (`public/brand/mark.svg`) and is extruded in 3D on the home page.
