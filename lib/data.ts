import "server-only";
import fs from "node:fs";
import path from "node:path";
import { readDB } from "./db";
import { tx } from "./i18n";
import type { Lang } from "./types";
import type { PublicSettings } from "@/components/providers";

export async function getPublicSettings(lang: Lang): Promise<PublicSettings> {
  const { settings: s } = await readDB();
  return {
    phone: s.phone,
    mobile: s.mobile,
    whatsapp: s.whatsapp,
    email: s.email,
    instagram: s.instagram,
    address: tx(s.address, lang),
    hours: tx(s.hours, lang),
    announcement: tx(s.announcement, lang),
    freeDeliveryOver: s.freeDeliveryOver,
    deliveryFees: s.deliveryFees,
  };
}

const STUDIO_DIR = path.join(process.cwd(), "public/images/products-v2");

/** Use the regenerated square studio shot as the cover when one exists for the product. */
function withStudio<T extends { slug: string; images: string[] }>(p: T): T {
  const studio = `/images/products-v2/${p.slug}.jpg`;
  if (p.images[0] === studio || !fs.existsSync(path.join(STUDIO_DIR, `${p.slug}.jpg`))) return p;
  return { ...p, images: [studio, ...p.images.filter((i) => i !== studio)] };
}

export async function getActiveProducts() {
  const db = await readDB();
  return db.products.filter((p) => p.status === "active").map(withStudio);
}

/** Categories in display order; only those with at least one live product. */
export async function getCategories() {
  const db = await readDB();
  const live = new Set(db.products.filter((p) => p.status === "active").map((p) => p.category));
  return [...db.categories].filter((c) => live.has(c.slug)).sort((a, b) => a.order - b.order);
}

export async function getProjects() {
  const db = await readDB();
  return [...db.projects].sort((a, b) => a.order - b.order);
}
