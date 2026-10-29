# TANFEEZ v2: White Redesign Brief

The client reviewed v1 (dark, very colourful, heavy 3D) and asked for **a totally different, calmer design**: white theme, far fewer colours, only a touch of TANFEEZ branding. References: **BoConcept (UAE)** and **Natuzzi Editions**. Goal: similar in spirit, better in execution, flawless on mobile, tablet and laptop.

---

## 1. What the reference sites do (studied in Chrome, 27 Oct 2026)

### BoConcept (boconcept.com/en-ae)
| Aspect | Observation |
|---|---|
| Canvas | Pure white `#FFFFFF`, ink `#1D1D1B`. Almost no colour. Product tiles sit on a light-grey plate `#F2F2F2`. |
| Type | **Helvetica Neue** bold for headings (31–37px, tight), **Baskerville serif** for sub-headlines and body copy ("Elegant living meets thoughtful design"). Category page title is a large serif ("Sofas"). |
| Header | Two rows: *Find store · logo centred · cart*, then *☰ Furniture Professionals · search with underline*. It collapses to one row on scroll, with a translucent white background. |
| Hero | Full-bleed video with a dark scrim; serif line plus bold line; two outlined buttons with a ⊕→ circled-arrow icon; a pause button bottom-right. |
| Buttons | Outlined, 1px `#B5B5B5`, radius 4px, 14px text, circled arrow icon. Text links use the same circled arrow. |
| Category carousel | "What are you looking for?": tall portrait images, label below, thin progress bar that fills as you scroll. |
| Product card | Square-ish grey plate, cut-out product photo, badge top-left ("Bestseller" / "New", small bordered tag), arrows on hover to flip images. Below: name, *Fabric • Metal*, colour dots "+ more options", "Rec. retail price" + "From" price. |
| Listing | Big serif title, sub-category image strip on the right, a sticky filter bar (*All filters* filled, then outlined chips *Colour · Material · Collection · Price · Seats*), "196 items", sort. **Editorial lifestyle images are mixed into the grid** (spanning 3 columns). |
| Sections | Media banners (wide image or video), "Endless possibilities" customisation block with a product trio on white, store finder banner, "Let us help you, no obligations" consultation CTA, real homes gallery, "70 years of craftsmanship" heritage block, guides and accordion. |
| Motion | Restrained: image cross-fades, carousels, header collapse. Nothing flashy. |

### Natuzzi Editions (natuzzi.com/ae/en, sofas & sectionals)
| Aspect | Observation |
|---|---|
| Canvas | White with a **soft blush band** `#F7EBE8` behind the header and title; the product grid **overlaps** the band's edge. |
| Type | **Söhne** (grotesk), all-lowercase headings ("sofas & sectionals"), big and tight; 13px UI text. |
| Header | Round black menu button, wordmark, lowercase category nav with an underline on the active item, icons (search · store · account). |
| Listing | 2-column large lifestyle images (landscape ~16:9); below each: name left, **black pill "Discover more"** right. Filter sidebar on the left ("designer +", "filter reset"). Outlined pill "sort by" dropdown. |
| Motion | Minimal; hover image swap; content fades. |

### What we take, and where we do better
- **Take:** white canvas, editorial serif and grotesk pairing, grey product plates, swatch dots, "From" pricing, sticky filter chips, editorial images in the grid, Natuzzi's tinted band that the grid overlaps, lowercase calm UI text, black pill buttons.
- **Do better:**
  - Buttery smooth scroll, image reveals (clip-path wipes), hover image swap with scale; a clean **3D animation** instead of 3D objects: a slow, cinematic image-plane parallax and a scroll-driven "room" depth effect, not a WebGL logo.
  - A true **quick view**, instant filtering without reloads, a mobile filter sheet, and a sticky add-to-bag bar.
  - Faster pages: next/image, no video weight on mobile.
  - **Fit-out projects** as a first-class editorial section (neither reference has this). This is TANFEEZ's strength.
  - Bilingual EN/AR with a perfect RTL layout (neither reference does Arabic well).

## 2. TANFEEZ v2 design system
- **Colours:** white `#FFFFFF`, ink `#1A1A1A`, grey plate `#F3F2F0`, warm band `#F6F1EA` (our Natuzzi-style band, warmer to suit the brand), lines `#E6E4E0`, muted text `#6E6B67`. **Brand yellow `#FFCB06` only as an accent**: the logo check mark, a small dot, active underline, focus ring, the "New" badge dot. Never as a background block.
- **Type:** headings in **Inter Tight** or **Manrope** (Helvetica/Söhne-like grotesk), sub-heads and editorial lines in **Fraunces** or **Cormorant** serif (Baskerville-like), Arabic in **IBM Plex Sans Arabic**.
- **Logo:** the existing roof + check mark in charcoal, with a yellow check. That is the only "colour".
- **Buttons:** black pill (primary), outlined pill (secondary), text link with a circled-arrow icon.
- **Imagery:** square product shots on a neutral studio background (regenerated in **Google Flow** from the PDF photos, keeping each piece identical), lifestyle and project photos full-bleed.
- **Motion:** 600–900ms ease-out; clip-path image reveals; soft parallax; a CSS 3D tilt on the hero image stack; marquee-free; no custom cursor; respects reduced motion.

## 3. Image plan (Google Flow)
1. Upload each product photo from `public/images/products/` to Flow as a reference.
2. Prompt: *"Professional furniture catalogue photo of exactly this [item], identical design, shape, material and colour. Square 1:1 composition, centred, on a seamless warm light-grey studio background (#F3F2F0), soft daylight, gentle floor shadow, 3/4 front view, ultra-sharp, no props, no text."*
3. Save as `public/images/products-v2/<slug>.jpg` (1:1, ≥1600px). Compare side by side with the original and reject anything that changes the design.
4. Also generate 3–4 lifestyle hero images (warm minimal Dubai villa interiors) featuring hero pieces.

## 4. Build steps
1. New design tokens and fonts; remove the dark theme, 3D logo, preloader, custom cursor and marquee.
2. New header (BoConcept-style two-row that collapses, centred logo), new footer (light).
3. Home: cinematic hero (image stack with depth parallax), category carousel with progress line, featured products carousel, customisation block, projects editorial, consultation CTA, heritage, journal/FAQ accordion.
4. Shop: Natuzzi band and title, sub-category strip, sticky filter chips plus mobile filter sheet, grey-plate cards, editorial tiles in the grid.
5. Product page: square gallery, swatches, sticky bag bar, accordion specs.
6. Projects, Services, About, Contact, Quote, Checkout restyled to match.
7. Admin unchanged (already light).
8. QA on mobile, tablet and desktop, in EN and AR.

---

## 5. Status (27 Oct 2026)
- ✅ Whole public site rebuilt in the white system: header, footer, home, shop, product, projects, case study, services, about, contact, quote, checkout, tracking.
- ✅ 3D logo, preloader, custom cursor, marquee and dark sections removed. Motion now: clip-path image reveals, parallax, a scroll-driven **3D fan-out** of three products (home "made to measure"), and a subtle 3D tilt on the projects image.
- ✅ **27 studio product images** regenerated in Google Flow (Nano Banana 2.1) from the PDF photos → `public/images/products-v2/`; plus a lifestyle hero → `public/images/lifestyle/hero.jpg`.
- ✅ Demo catalogue curated for screen recording: 27 live products; 11 without studio images set to **draft** (re-enable any time in Admin → Products).
- The Flow project "Oct 27 - 10:57" in the client's Google account holds every source and generation.

### When the real catalogue and photo shoot arrive
1. Drop square photos named `<product-slug>.jpg` into `public/images/products-v2/` (or upload them in Admin → Products).
2. Run `node scripts/apply-studio.mjs`. Products with a photo go live with it as the cover; the rest become drafts.
3. Update prices and details in Admin, or rebuild `scripts/seed.mjs` and run `npm run seed`.

## Client feedback round (Oct 2026)

| Ask | Where it lives |
|---|---|
| Lifestyle room photos | `public/images/lifestyle/look-*.jpg` (Emerald Hour, Library Majlis, Blush Suite, Fireside Majlis + hero) |
| Shop the look | `lib/looks.ts` (pins as % of the image) → `components/home/ShopTheLook.tsx` on the home page, `/inspiration` stacked lookbook, and "In the room" shots in each product gallery (cropped around the product's pin) |
| Customise fabric / colour / size, live price, free samples | `lib/configurator.ts` (pricing, also re-checked on the server in `placeOrder`) + `components/shop/Configurator.tsx`; sample requests land in Admin → Requests as "Fabric samples" |
| Home vs Business | Header `ModeSwitch` (desktop row + mobile row); nav changes by path; `/business` page (sector hover list, process timeline, project reel) |
| Tabby / Tamara | Product page instalment line + modal, checkout options with live schedule; stored as `payment: "tabby" \| "tamara"` on orders (UI only, no gateway integration yet) |

**Adding a look:** generate a 16:9 room in Flow, process it to 2400px into `public/images/lifestyle/`, then add an entry to `LOOKS` in `lib/looks.ts` with the pin x/y percentages.

## Full catalogue + intro (Oct 29)
- All 38 products are live with studio shots in `public/images/products-v2/` (11 joinery/commercial pieces added).
  Already-seeded databases pick this up through the `2026-10-29-full-catalogue` migration in `lib/db.ts`.
- 19 room scenes in `lib/looks.ts`; every live piece appears in at least one. Home shows the six in `HOME_LOOKS`;
  `/inspiration` has all of them with room filters. Rooms where everything is made to order show a quote button instead of a basket.
- First-visit intro: `components/site/Preloader.tsx` + `.pl-*` styles in `app/globals.css`. Plays once per browser session;
  reel images live in `public/images/intro/` (the last one should match the home hero).
