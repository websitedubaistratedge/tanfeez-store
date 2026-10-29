import type { L10n, Product } from "./types";

/**
 * Styled room scenes. Each pin is a percentage of the image (0–100) pointing at the
 * piece in the photo; `slug` must match a live product or the pin is dropped.
 * To add a look: drop a landscape photo in public/images/lifestyle/ and list it here.
 */
export type Look = {
  id: string;
  title: L10n;
  mood: L10n;
  image: string;
  w: number;
  h: number;
  pins: { slug: string; x: number; y: number }[];
};

export const LOOKS: Look[] = [
  {
    id: "emerald",
    title: { en: "Emerald Hour", ar: "ساعة الزمرّد" },
    mood: { en: "Marina penthouse · velvet & skyline", ar: "بنتهاوس المارينا · مخمل وأفق" },
    image: "/images/lifestyle/look-emerald.jpg",
    w: 2400,
    h: 1340,
    pins: [
      { slug: "velluto-tufted-sofa", x: 58, y: 60 },
      { slug: "coral-shell-lounge-chair", x: 21, y: 68 },
      { slug: "nord-leather-armchair", x: 83, y: 70 },
    ],
  },
  {
    id: "library",
    title: { en: "The Library Majlis", ar: "مجلس المكتبة" },
    mood: { en: "Mashrabiya light · cognac leather", ar: "ضوء المشربية · جلد كونياك" },
    image: "/images/lifestyle/look-library.jpg",
    w: 2400,
    h: 1340,
    pins: [
      { slug: "chesterfield-heritage-sofa", x: 33, y: 60 },
      { slug: "wingback-chesterfield-chair", x: 85, y: 50 },
    ],
  },
  {
    id: "blush",
    title: { en: "Blush Suite", ar: "جناح الوردي" },
    mood: { en: "Morning light · travertine & velvet", ar: "ضوء الصباح · ترافرتين ومخمل" },
    image: "/images/lifestyle/look-blush.jpg",
    w: 2400,
    h: 1340,
    pins: [
      { slug: "blush-couture-bed", x: 60, y: 30 },
      { slug: "velvet-chaise-daybed", x: 43, y: 74 },
    ],
  },
  {
    id: "fireside",
    title: { en: "Fireside Majlis", ar: "مجلس الموقد" },
    mood: { en: "Emirates Hills · after dark", ar: "تلال الإمارات · بعد الغروب" },
    image: "/images/lifestyle/look-fireside.jpg",
    w: 2400,
    h: 1340,
    pins: [
      { slug: "ember-fireplace-wall", x: 28, y: 42 },
      { slug: "milano-leather-sofa", x: 73, y: 72 },
    ],
  },
  {
    id: "quiet",
    title: { en: "Quiet Hour", ar: "ساعة هادئة" },
    mood: { en: "Villa living · bouclé & stone", ar: "معيشة الفيلا · بوكليه وحجر" },
    image: "/images/lifestyle/hero.jpg",
    w: 2400,
    h: 1340,
    pins: [{ slug: "cloud-curve-sofa", x: 58.5, y: 60 }],
  },
];

export function resolveLooks(products: Product[]) {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return LOOKS.map(({ pins, ...look }) => ({
    ...look,
    pins: pins.flatMap((pin) => {
      const product = bySlug.get(pin.slug);
      return product ? [{ product, x: pin.x, y: pin.y }] : [];
    }),
  })).filter((l) => l.pins.length > 0);
}

/** Room photos featuring a given product, for its gallery. */
export function roomsFor(slug: string, lang: "en" | "ar") {
  return LOOKS.flatMap((l) => {
    const pin = l.pins.find((p) => p.slug === slug);
    return pin ? [{ image: l.image, title: l.title[lang], x: pin.x, y: pin.y }] : [];
  });
}
