# TANFEEZ — Website, E‑Store & Admin Platform (Demo Plan)

> Source: *TANFEEZ Company Profile 2024* (37 pages). Goal: the best‑looking, most user‑friendly fit‑out & furniture website in the Middle East. It is a real e‑store with a full admin back office, and it works just as well on mobile as on desktop.

---

## 1. What we extracted from the PDF

### Company
| Field | Value |
|---|---|
| Legal name | TANFEEZ AAMAL TECHNICAL CONTRACTING LLC |
| Founded | 2021 |
| HQ / Workshop | Dubai Investment Park 2, Khalifa Al Mazrouei Bldg, Warehouse 2, Dubai, UAE |
| Tel / Mobile | +971 4 835 8197 · +971 50 899 6838 |
| Email | info@tanfeez.me |
| Scope | Furniture Production · Fit‑out · Technical Works |
| Coverage | Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah |
| Sectors | Commercial, industrial, public; retail, F&B, offices, hospitality, residential, staff accommodation |

### Messaging
- **Mission:** cutting‑edge quality products and services, at the right time and place, with zero tolerance for errors and delays.
- **Vision:** to be seen and recommended as the most favourable fit‑out and technical services company in the UAE.
- **Goal:** customer satisfaction is the ultimate goal.
- **Objectives:** state‑of‑the‑art design, fit‑out and maintenance, using the latest technologies and industry practices.
- **Principle:** honesty and quality service.

### Brand identity
- **Logo:** a house roof with chimney (charcoal) and a check mark (yellow), meaning "home / space, done right". Both the colour and white versions are extracted.
- **Colours:** Yellow `#FFCB06` · Charcoal `#231F20` · White `#FFFFFF` (plus warm neutrals for the UI).
- **Visual language:** bold yellow diagonal triangles, heavy geometric sans type, craftsmanship photography (gloves, drills, timber).

### Portfolio (25 projects in the PDF)
Hovi Digital Lab (DIC, office) · Lalique Tamer Beauty (D3, office) · The Art of Shaving (Sharjah Airport) · Home of Scent (Marina Mall AUH) · The Scent Library (Jumeirah) · 55 Car Care (Al Quoz) · Galeries Lafayette L'Outlet (Ibn Battuta) · Pellini (Dubai Hills & Festival City) · Drykorn (Dubai Mall) · Peserico (Dubai Mall) · Pal Zileri (Dubai Mall) · Corneliani (Dubai Mall) · The Edit, Galeries Lafayette (Dubai Mall) · VOX Cinema Theatre (MoE) · L'Étrange (Dubai Mall) · Fashion Kids, Harvey Nichols (MoE) · Vilhelm Parfumerie (Dubai Mall) · The Ceremony kiosk (Avenue Mall) · Abu Al Abyad Staff Accommodation (AUH) · Lafayette Gourmet ×2 (Dubai Mall) · IZU Brasserie (Dubai Mall) · M'OISHI kiosk (Yas Mall) · Pentagon Coffee kiosk (AUH) · Treasure Island (Dubai Mall) · Residential: sofas, armchairs, beds, TV walls, staircases, wardrobes, vanities, dining tables.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/SEO, API routes and admin in one app |
| Styling | **Tailwind CSS v4** + CSS variables (brand tokens) | Fast, consistent, responsive |
| Motion | **Framer Motion** (UI, page transitions) + **Lenis** (smooth scroll) | Premium feel |
| 3D | **React Three Fiber + drei** | 3D extruded TANFEEZ logo hero, floating materials |
| State | **Zustand** (cart, wishlist, language), persisted | Simple and fast |
| Data (demo) | **JSON file DB** (`data/db.json`) behind a repository layer | No setup, runs anywhere, and the repo layer can be swapped for Postgres/Prisma later |
| Uploads | `public/uploads` via API route | Admin image upload |
| Auth (admin) | Signed HTTP‑only cookie, password from `.env` | Simple and secure enough for the demo |
| Icons / Fonts | lucide‑react · **Montserrat** (Latin, matches logo) + **Cairo/Tajawal** (Arabic) | |
| i18n | EN / **AR with full RTL** toggle | A must for a Middle East leader |

---

## 3. Sitemap

### Public site
1. **Home**
   - 3D hero: extruded roof + check logo that rotates with the mouse and scroll, plus a headline ("We build spaces that work.")
   - Marquee of client brands (Galeries Lafayette, VOX, Harvey Nichols, Corneliani…)
   - Animated stats counters (projects, emirates covered, years, on‑time delivery)
   - Services: 3 pillars (Fit‑out · Furniture Production · Technical Works) as 3D tilt cards
   - Featured projects: horizontal scroll gallery pinned on scroll
   - Process timeline (Consult, Design, Produce, Install, Handover) drawn as you scroll
   - Shop teaser (featured products)
   - Mission and vision split section with yellow diagonal reveals
   - Request‑a‑quote CTA band
2. **Shop** (e‑store): category chips, search, filters (category, price, material, in stock), sort, grid/list views, quick‑view modal, wishlist
3. **Product page**: image gallery with zoom, finish/size options, price, stock, add to cart, "Request custom size" button, specs, related products
4. **Cart drawer + Checkout**: shipping details, delivery emirate, payment method (Cash on Delivery / Bank Transfer for the demo), order confirmation with order number
5. **Projects** (portfolio): filter by sector (Retail, F&B, Office, Hospitality, Residential), masonry grid, case‑study page with gallery lightbox
6. **Services**: detail per service with capabilities and the process
7. **About**: story since 2021, mission, vision, objectives, coverage map of the UAE emirates
8. **Request a Quote**: multi‑step wizard (project type, space and size, budget and timeline, contact details with file upload)
9. **Contact**: form, map, WhatsApp button, click‑to‑call
10. **Order tracking** (by order number + phone)

### Admin panel (`/admin`)
- **Login**
- **Dashboard**: KPIs (revenue, orders, open requests, products, low stock), sales chart, latest orders and requests
- **Products**: list, search, create, edit, delete, image upload, featured toggle, stock, price/sale price, EN/AR names
- **Categories**: CRUD
- **Projects (portfolio)**: CRUD, sector, location, client, gallery, featured on home
- **Orders**: list, detail, status pipeline (New → Confirmed → In Production → Out for Delivery → Delivered / Cancelled)
- **Quote Requests**: Kanban board (New → Contacted → Site Visit → Quoted → Won / Lost), notes, assignee
- **Messages**: contact form inbox
- **Settings**: company info, contact details, hero texts, social links, delivery fees per emirate

---

## 4. Design system
- **Palette:** Yellow `#FFCB06` (accent / CTA), Charcoal `#231F20` (ink / dark sections), Ink‑900 `#0F0D0E` (hero background), Sand `#F6F3EE` (light sections), Steel greys.
- **Signature motif:** the yellow diagonal triangle from the PDF, used as section wipes, image masks and hover reveals.
- **Type:** Montserrat 800/900 for display (uppercase, tight tracking), Inter/Montserrat for body; Tajawal/Cairo for Arabic.
- **Motion principles:** purposeful and fast (≤600 ms), easing `[0.22, 1, 0.36, 1]`, respects `prefers-reduced-motion`.
- **Effects:** custom magnetic cursor (desktop only), grain overlay, parallax images, text split reveals, 3D tilt cards, scroll‑linked progress, page transitions with a yellow wipe, skeleton loaders.
- **Mobile:** thumb‑friendly bottom nav in the shop, swipeable galleries, simplified 3D (lower DPR), sticky add‑to‑cart bar.

## 5. Assets
- **From the PDF:** logos (colour + white), 100+ real project photos, and residential furniture photos used for products. These are authentic and the strongest asset we have.
- **Recreated:** vector SVG of the logo mark, used for the 3D extrusion and the favicon.
- **Optional, AI‑generated (Google Flow via Chrome):** hero backgrounds, lifestyle product shots and a hero loop video, if we want visuals beyond what the PDF provides.
- **Stock:** only where needed (e.g. workshop/craft textures).

## 6. Build phases
1. ✅ Extract the PDF: text, logos (vectorised), 62 project photos, 38 furniture photos
2. ✅ Scaffold Next.js, design tokens, fonts, layout, nav, footer, smooth scroll, cursor, preloader, page transitions
3. ✅ Data layer (JSON DB, seed from the PDF content) and server actions
4. ✅ Home page with 3D hero and all scroll sections
5. ✅ Shop, product page, cart drawer, checkout, order tracking
6. ✅ Projects and case studies, services, about, contact, quote wizard
7. ✅ Admin: auth, dashboard, products, categories, projects, orders, requests (Kanban), messages, settings
8. ✅ AR/RTL (UI + all seeded content bilingual)
9. ⏳ Polish: visual QA in browser (desktop/mobile/RTL), performance, accessibility
10. Optional: AI imagery via Google Flow; deploy to Vercel (DB swapped for Postgres/Supabase for production)

## 7. Needed from the client (for production, not for the demo)
- [ ] Real product catalogue: names, prices, dimensions, materials, stock
- [ ] High‑resolution project photos (the PDF images are compressed)
- [ ] Vector logo file (AI/SVG/EPS)
- [ ] Payment gateway account (Stripe / Network International / Telr / Tabby for BNPL)
- [ ] Domain + hosting decision (tanfeez.me?)
- [ ] Delivery fees and areas, VAT (5%) and trade licence/TRN for invoices
- [ ] Arabic copy review by a native speaker
- [ ] WhatsApp Business number, social links (Instagram, LinkedIn)
- [ ] Google Maps pin for the workshop

## 8. Demo credentials
- Admin: `/admin`, password set in `.env.local` (`ADMIN_PASSWORD`, default `tanfeez-admin` for the demo)
