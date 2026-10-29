// Promote regenerated studio shots (public/images/products-v2/<slug>.jpg) to each product's cover image,
// and set products without one to "draft" so the demo catalogue looks consistent.
// Run: node scripts/apply-studio.mjs   (updates data/seed.json and data/db.json if present)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/images/products-v2");
const studio = new Set(fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).map((f) => f.replace(/\.jpg$/, "")));

for (const file of ["data/seed.json", "data/db.json"]) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  const db = JSON.parse(fs.readFileSync(p, "utf8"));
  let live = 0;
  for (const prod of db.products) {
    const src = `/images/products-v2/${prod.slug}.jpg`;
    if (studio.has(prod.slug)) {
      prod.images = [src, ...prod.images.filter((i) => i !== src)];
      prod.status = "active";
      live++;
    } else prod.status = "draft";
  }
  fs.writeFileSync(p, JSON.stringify(db, null, 1));
  console.log(`${file}: ${live} live, ${db.products.length - live} draft`);
}
