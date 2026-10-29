// Product configurator: material → colour → size, with live pricing.
// Pure functions shared by the client UI and the server (placeOrder recomputes prices).
import type { L10n, Product } from "./types";

export type Swatch = { id: string; name: L10n; hex: string };
export type Material = { id: string; name: L10n; note: L10n; delta: number; colours: Swatch[] };

const sw = (id: string, en: string, ar: string, hex: string): Swatch => ({ id, name: { en, ar }, hex });

export const UPHOLSTERY: Material[] = [
  {
    id: "boucle",
    name: { en: "Bouclé", ar: "بوكليه" },
    note: { en: "Soft looped texture, very durable", ar: "ملمس حلقي ناعم ومتين جداً" },
    delta: 0,
    colours: [sw("ivory", "Ivory", "عاجي", "#ECE6DA"), sw("oat", "Oat", "شوفان", "#D8C8AE"), sw("stone", "Stone", "حجري", "#9C9A96"), sw("charcoal", "Charcoal", "فحمي", "#4A4543")],
  },
  {
    id: "linen",
    name: { en: "Linen blend", ar: "مزيج الكتان" },
    note: { en: "Breathable, relaxed and matte", ar: "قابل للتنفس، مريح وغير لامع" },
    delta: 0.04,
    colours: [sw("sand", "Sand", "رملي", "#D9CBB2"), sw("sage", "Sage", "مريمية", "#A3AE98"), sw("clay", "Clay", "طيني", "#B98B6E"), sw("ink", "Ink blue", "أزرق حبري", "#3C4A5E")],
  },
  {
    id: "velvet",
    name: { en: "Performance velvet", ar: "مخمل عالي الأداء" },
    note: { en: "Deep colour, stain-resistant pile", ar: "ألوان عميقة ووبر مقاوم للبقع" },
    delta: 0.12,
    colours: [sw("emerald", "Emerald", "زمردي", "#1F5A43"), sw("blush", "Blush", "وردي", "#D9B2A9"), sw("ocean", "Ocean", "محيطي", "#2E4D7B"), sw("ochre", "Ochre", "مغرة", "#C1913A"), sw("graphite", "Graphite", "غرافيتي", "#3A3A3C")],
  },
  {
    id: "leather",
    name: { en: "Full-grain leather", ar: "جلد طبيعي كامل" },
    note: { en: "Ages beautifully, hand-finished", ar: "يزداد جمالاً مع الوقت، تشطيب يدوي" },
    delta: 0.28,
    colours: [sw("cognac", "Cognac", "كونياك", "#8A4A25"), sw("tobacco", "Tobacco", "تبغي", "#5C3B24"), sw("black", "Black", "أسود", "#1E1C1B"), sw("navy", "Ocean blue", "أزرق محيطي", "#2E4D7B")],
  },
];

export const WOOD: Material[] = [
  {
    id: "oak",
    name: { en: "Natural oak", ar: "بلوط طبيعي" },
    note: { en: "European oak, oiled finish", ar: "بلوط أوروبي بتشطيب زيتي" },
    delta: 0,
    colours: [sw("raw", "Raw oak", "بلوط خام", "#C49A6C"), sw("smoked", "Smoked oak", "بلوط مدخّن", "#7A5A3E")],
  },
  {
    id: "walnut",
    name: { en: "American walnut", ar: "جوز أمريكي" },
    note: { en: "Rich grain, hand-selected veneers", ar: "عروق غنية وقشور مختارة يدوياً" },
    delta: 0.15,
    colours: [sw("walnut", "Walnut", "جوز", "#5C3A21")],
  },
  {
    id: "ash",
    name: { en: "Black ash", ar: "رماد أسود" },
    note: { en: "Stained ash, open grain", ar: "رماد مصبوغ بعروق ظاهرة" },
    delta: 0.08,
    colours: [sw("black-ash", "Black ash", "رماد أسود", "#1E1C1B")],
  },
  {
    id: "lacquer",
    name: { en: "Satin lacquer", ar: "لاكر ساتان" },
    note: { en: "Any colour, silky smooth", ar: "أي لون بملمس حريري" },
    delta: 0.1,
    colours: [sw("white", "Matt white", "أبيض مطفي", "#F2F0EC"), sw("greige", "Greige", "رمادي بيج", "#B8AFA3"), sw("blush-lq", "Blush", "وردي", "#E3C3BC"), sw("lagoon", "Lagoon", "لاجون", "#2E4D7B")],
  },
];

const UPHOLSTERED = new Set(["sofas", "armchairs", "beds"]);

export function materialsFor(p: Pick<Product, "category">): Material[] {
  return UPHOLSTERED.has(p.category) ? UPHOLSTERY : WOOD;
}

/** Best-guess starting configuration from the product's own description and first finish. */
export function defaultConfig(p: Product): { material: string; colour: string; size: number } {
  const mats = materialsFor(p);
  const text = `${p.materials.en} ${p.finishes.map((f) => f.name.en).join(" ")}`.toLowerCase();
  const order = ["leather", "velvet", "bouclé", "boucle", "linen", "walnut", "lacquer", "ash", "oak"];
  const hit = order.find((k) => text.includes(k));
  const id = hit === "bouclé" ? "boucle" : hit;
  const material = mats.find((m) => m.id === id) ?? mats[0];
  const target = p.finishes[0]?.hex;
  const colour = target ? nearest(material.colours, target) : material.colours[0];
  return { material: material.id, colour: colour.id, size: 0 };
}

function nearest(list: Swatch[], hex: string) {
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r, g, b] = rgb(hex);
  return list.reduce((best, s) => {
    const [r2, g2, b2] = rgb(s.hex);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    return d < best.d ? { s, d } : best;
  }, { s: list[0], d: Infinity }).s;
}

const round = (n: number, to: number) => Math.round(n / to) * to;

/** Extra cost for the i-th size (larger sizes cost more). */
export function sizeDelta(p: Pick<Product, "price" | "salePrice">, i: number) {
  return i <= 0 ? 0 : round((p.salePrice || p.price) * 0.14 * i, 50);
}

export function configPrice(p: Product, cfg: { material?: string; size?: number }) {
  const base = p.salePrice || p.price;
  const m = materialsFor(p).find((x) => x.id === cfg.material);
  const materialAdd = m ? round(base * m.delta, 50) : 0;
  const sizeAdd = sizeDelta(p, cfg.size ?? 0);
  return { base, materialAdd, sizeAdd, total: base + materialAdd + sizeAdd };
}

export function describeConfig(p: Product, cfg: { material?: string; colour?: string }, lang: "en" | "ar" = "en") {
  const m = materialsFor(p).find((x) => x.id === cfg.material);
  const c = m?.colours.find((x) => x.id === cfg.colour);
  return [m?.name[lang], c?.name[lang]].filter(Boolean).join(" · ");
}
