// Builds lib/generated/colour-photos.json from public/images/products-v2/colours/<slug>-<colour>.jpg
// and copies the same data into data/seed.json. Run after adding colour photos:
//   node scripts/colour-photos.mjs
import fs from "node:fs";

// Which configurator colour each product's main studio photo shows.
const PHOTO_COLOUR = {
  // sofas & armchairs
  "chesterfield-heritage-sofa": "cognac",
  "velvet-chaise-daybed": "charcoal",
  "cloud-curve-sofa": "stone",
  "alba-modular-corner": "ivory",
  "riviera-channel-sofa": "stone",
  "velluto-tufted-sofa": "emerald",
  "milano-leather-sofa": "cognac",
  "sahara-l-sofa": "ivory",
  "coral-shell-lounge-chair": "ocean",
  "nord-leather-armchair": "navy",
  "wingback-chesterfield-chair": "cognac",
  // beds
  "blush-couture-bed": "blush",
  "atelier-storage-bed": "stone",
  "walnut-platform-bed": "stone",
  "floating-oak-bed": "ivory",
  "cane-oak-bed": "raw",
  // media walls, storage, tables, joinery (what the photo actually shows)
  "concrete-media-wall": "raw",
  "slatted-media-unit": "raw",
  "ember-fireplace-wall": "walnut",
  "walnut-frame-tv-wall": "raw",
  "lagoon-lacquer-media": "lagoon",
  "blush-sliding-wardrobe": "white",
  "study-nook-desk": "white",
  "live-edge-walnut-table": "walnut",
  "walnut-vanity-console": "walnut",
  "lumiere-vanity": "white",
  "barn-sliding-door": "walnut",
  "slatted-partition-console": "raw",
};

// Pieces whose category suggests the wrong choice of materials.
const MATERIAL_TYPE = { "cane-oak-bed": "wood" };

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
for (const [slug, t] of Object.entries(MATERIAL_TYPE)) (out[slug] ??= { colourImages: {} }).materialType = t;

fs.writeFileSync("lib/generated/colour-photos.json", JSON.stringify(out, null, 2) + "\n");
for (const p of seed.products) {
  const v = out[p.slug];
  if (!v) continue;
  if (v.photoColour) p.photoColour = v.photoColour;
  if (v.materialType) p.materialType = v.materialType;
  p.colourImages = { ...v.colourImages, ...(p.colourImages ?? {}) };
}
fs.writeFileSync("data/seed.json", JSON.stringify(seed, null, 1) + "\n");
const n = Object.values(out).reduce((s, v) => s + Object.keys(v.colourImages).length, 0);
console.log(`colour photos: ${n} across ${Object.keys(out).length} products`);
