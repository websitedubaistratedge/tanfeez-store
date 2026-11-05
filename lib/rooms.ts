import type { Product } from "./types";

// Room groups used by the menu and Shop: "Living" and "Bedroom" each gather a few categories.
// The shop accepts them like a category (/shop?c=living), and the phone menu lists their parts.

export type RoomId = "living" | "bedroom";
type Link = { href: string; en: string; ar: string };

export const ROOMS: Record<RoomId, { en: string; ar: string; blurb: { en: string; ar: string }; has: (p: Pick<Product, "category" | "slug">) => boolean; links: Link[] }> = {
  living: {
    en: "Living room",
    ar: "غرفة المعيشة",
    blurb: { en: "Sofas, armchairs, media walls and tables for the room you live in most.", ar: "كنب وكراسي وجدران تلفاز وطاولات للغرفة التي تعيش فيها أكثر." },
    has: (p) => ["sofas", "armchairs", "media", "tables"].includes(p.category) && !/vanity/.test(p.slug),
    links: [
      { href: "/shop?c=sofas", en: "Sofas", ar: "الكنب" },
      { href: "/shop?c=armchairs", en: "Armchairs", ar: "الكراسي المنفردة" },
      { href: "/shop?c=media", en: "TV & media walls", ar: "جدران التلفاز" },
      { href: "/shop?c=tables", en: "Tables", ar: "الطاولات" },
    ],
  },
  bedroom: {
    en: "Bedroom",
    ar: "غرفة النوم",
    blurb: { en: "Beds, wardrobes and vanities, made to your room's measurements.", ar: "أسرّة وخزائن وتسريحات بمقاسات غرفتك." },
    has: (p) => p.category === "beds" || p.category === "storage" || /vanity/.test(p.slug),
    links: [
      { href: "/shop?c=beds", en: "Beds", ar: "الأسرّة" },
      { href: "/shop?c=storage", en: "Wardrobes & storage", ar: "الخزائن والتخزين" },
      { href: "/shop?c=vanities", en: "Vanities", ar: "التسريحات" },
    ],
  },
};

/** Small sub-groups that aren't categories of their own. */
export const SUBSETS: Record<string, { en: string; ar: string; has: (p: Pick<Product, "category" | "slug">) => boolean }> = {
  vanities: { en: "Vanities", ar: "التسريحات", has: (p) => /vanity/.test(p.slug) },
};

export const isRoom = (c: string): c is RoomId => c in ROOMS;
