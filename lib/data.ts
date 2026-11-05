import "server-only";
import { readDB } from "./db";
import { DEFAULT_MATERIALS } from "./configurator";
import { publicPayments } from "./payments";
import { hasImage } from "./assets";
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
    materials: s.materials ?? DEFAULT_MATERIALS,
    company: { licence: s.company?.licence ?? "", authority: s.company?.authority ?? "", trn: s.company?.trn ?? "" },
    payments: publicPayments(s.payments),
  };
}

/** Inspiration rooms in their admin order. */
export async function getLooks() {
  return (await readDB()).looks ?? [];
}

/** Use the regenerated square studio shot as the cover when one exists for the product. */
function withStudio<T extends { slug: string; images: string[] }>(p: T): T {
  const studio = `/images/products-v2/${p.slug}.jpg`;
  if (p.images[0] === studio || !hasImage(studio)) return p;
  return { ...p, images: [studio, ...p.images.filter((i) => i !== studio)] };
}

export async function getActiveProducts() {
  const db = await readDB();
  return db.products.filter((p) => p.status === "active").map(withStudio);
}

/** Pieces made for shops, kiosks and receptions: shown under For business, not in the home shop. */
export const BUSINESS_CATEGORIES = new Set(["commercial"]);
export const isBusinessProduct = (p: { category: string }) => BUSINESS_CATEGORIES.has(p.category);

/** Furniture for homes: what Shop all, the home page and search show. */
export async function getHomeProducts() {
  return (await getActiveProducts()).filter((p) => !isBusinessProduct(p));
}

export async function getBusinessProducts() {
  return (await getActiveProducts()).filter(isBusinessProduct);
}

export async function getHomeCategories() {
  return (await getCategories()).filter((c) => !BUSINESS_CATEGORIES.has(c.slug));
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
