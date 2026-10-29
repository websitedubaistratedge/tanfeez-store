// Lists the regenerated studio/lifestyle images so the app can check for them
// without a filesystem (Cloudflare Workers has none). Runs before dev and build.
import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const dirs = ["images/products-v2", "images/lifestyle"];
const files = dirs.flatMap((d) => {
  const abs = path.join(root, "public", d);
  return fs.existsSync(abs) ? fs.readdirSync(abs).filter((f) => !f.startsWith(".")).map((f) => `/${d}/${f}`) : [];
});
fs.writeFileSync(path.join(root, "lib/generated/public-images.json"), JSON.stringify(files.sort(), null, 1) + "\n");
console.log(`asset manifest: ${files.length} images`);
