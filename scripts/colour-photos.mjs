// Builds lib/generated/colour-photos.json from public/images/products-v2/colours/<slug>-<colour>.jpg
// and copies the same data into data/seed.json. Run after adding colour photos:
//   node scripts/colour-photos.mjs
import fs from "node:fs";

// Which configurator colour each product's main studio photo shows.
const PHOTO_COLOUR = {
  "chesterfield-heritage-sofa": "cognac",
  "velvet-chaise-daybed": "charcoal",
  "cloud-curve-sofa": "stone",
  "alba-modular-corner": "ivory",
  "riviera-channel-sofa": "sand",
  "velluto-tufted-sofa": "emerald",
  "milano-leather-sofa": "cognac",
  "sahara-l-sofa": "stone",
  "coral-shell-lounge-chair": "ocean",
  "nord-leather-armchair": "navy",
  "wingback-chesterfield-chair": "cognac",
  "blush-couture-bed": "blush",
  "atelier-storage-bed": "stone",
};

const dir = "public/images/products-v2/colours";
const seed = JSON.parse(fs.readFileSync("data/seed.json", "utf8"));
const slugs = seed.products.map((p) => p.slug).sort((a, b) => b.length - a.length);
const out = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort()) {
  const name = f.slice(0, -4);
  const slug = slugs.find((s) => name.startsWith(s + "-"));
  if (!slug) continue;
  const colour = name.slice(slug.length + 1);
  (out[slug] ??= { photoColour: PHOTO_COLOUR[slug], colourImages: {} }).colourImages[colour] = `/images/products-v2/colours/${f}`;
}
for (const [slug, v] of Object.entries(PHOTO_COLOUR)) out[slug] ??= { photoColour: v, colourImages: {} };

fs.writeFileSync("lib/generated/colour-photos.json", JSON.stringify(out, null, 2) + "\n");
for (const p of seed.products) {
  const v = out[p.slug];
  if (!v) continue;
  if (v.photoColour) p.photoColour = v.photoColour;
  p.colourImages = { ...v.colourImages, ...(p.colourImages ?? {}) };
}
fs.writeFileSync("data/seed.json", JSON.stringify(seed, null, 1) + "\n");
const n = Object.values(out).reduce((s, v) => s + Object.keys(v.colourImages).length, 0);
console.log(`colour photos: ${n} across ${Object.keys(out).length} products`);
