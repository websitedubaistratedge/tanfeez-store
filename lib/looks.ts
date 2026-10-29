import type { Look, Product, RoomKind } from "./types";

/**
 * Inspiration rooms ("shop the look"). The live list is stored in the database and edited in
 * Admin → Inspiration; DEFAULT_LOOKS below is only the starting set used to seed it.
 * Pins are percentages of the image (0–100); seeds refer to products by slug.
 */
type SeedLook = Omit<Look, "pins" | "room" | "home" | "live" | "createdAt"> & { pins: { slug: string; x: number; y: number }[] };

export type { RoomKind };

const DEFAULT_LOOKS: SeedLook[] = [
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
    id: "harbour",
    title: { en: "Harbour Lounge", ar: "صالة المرفأ" },
    mood: { en: "Dubai Harbour · golden hour & sea air", ar: "مرفأ دبي · الساعة الذهبية ونسيم البحر" },
    image: "/images/lifestyle/look-harbour.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "walnut-frame-tv-wall", x: 22, y: 26 },
      { slug: "harbour-lounge-set", x: 75, y: 70 },
    ],
  },
  {
    id: "alba",
    title: { en: "Alba Family Room", ar: "غرفة عائلة ألبا" },
    mood: { en: "Arabian Ranches · bouclé & concrete", ar: "المرابع العربية · بوكليه وخرسانة" },
    image: "/images/lifestyle/look-alba.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "concrete-media-wall", x: 37, y: 30 },
      { slug: "alba-modular-corner", x: 78, y: 66 },
    ],
  },
  {
    id: "riviera",
    title: { en: "Riviera Living", ar: "معيشة الريفييرا" },
    mood: { en: "Jumeirah Bay · oak slats & soft grey", ar: "خليج جميرا · شرائح البلوط والرمادي الناعم" },
    image: "/images/lifestyle/look-riviera.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "riviera-channel-sofa", x: 25, y: 68 },
      { slug: "slatted-media-unit", x: 62, y: 64 },
    ],
  },
  {
    id: "sahara",
    title: { en: "Sahara Majlis", ar: "مجلس الصحراء" },
    mood: { en: "Family majlis · dusk & dallah", ar: "مجلس العائلة · الغسق والدلّة" },
    image: "/images/lifestyle/look-sahara.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "lagoon-lacquer-media", x: 25, y: 50 },
      { slug: "sahara-l-sofa", x: 82, y: 66 },
    ],
  },
  {
    id: "supper",
    title: { en: "Supper Club", ar: "نادي العشاء" },
    mood: { en: "Iftar for eight · walnut & lantern light", ar: "إفطار لثمانية · جوز وضوء الفوانيس" },
    image: "/images/lifestyle/look-supper.jpg",
    w: 1376,
    h: 768,
    pins: [{ slug: "live-edge-walnut-table", x: 33, y: 58 }],
  },
  {
    id: "walnut",
    title: { en: "Walnut Retreat", ar: "ملاذ الجوز" },
    mood: { en: "Emirates Hills · late-afternoon calm", ar: "تلال الإمارات · هدوء ما قبل الغروب" },
    image: "/images/lifestyle/look-walnut.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "walnut-platform-bed", x: 40, y: 74 },
      { slug: "walnut-vanity-console", x: 72, y: 72 },
    ],
  },
  {
    id: "oak",
    title: { en: "Oak Suite", ar: "جناح البلوط" },
    mood: { en: "Palm Jumeirah · morning light", ar: "نخلة جميرا · ضوء الصباح" },
    image: "/images/lifestyle/look-oak.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "lumiere-vanity", x: 16, y: 34 },
      { slug: "floating-oak-bed", x: 54, y: 68 },
    ],
  },
  {
    id: "atelier",
    title: { en: "Atelier Bedroom", ar: "غرفة الأتيليه" },
    mood: { en: "Downtown · blue hour", ar: "وسط المدينة · الساعة الزرقاء" },
    image: "/images/lifestyle/look-atelier.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "atelier-storage-bed", x: 25, y: 72 },
      { slug: "blush-sliding-wardrobe", x: 77, y: 50 },
    ],
  },
  {
    id: "guest",
    title: { en: "The Guest Room", ar: "غرفة الضيوف" },
    mood: { en: "Dubai Hills · cane, limewash & walnut", ar: "دبي هيلز · خيزران وجير وجوز" },
    image: "/images/lifestyle/look-guest.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "cane-oak-bed", x: 38, y: 62 },
      { slug: "barn-sliding-door", x: 76, y: 45 },
    ],
  },
  {
    id: "petal",
    title: { en: "Petal Room", ar: "غرفة البتلة" },
    mood: { en: "A little girl's nook · blush & cream", ar: "ركن طفلة صغيرة · وردي وكريمي" },
    image: "/images/lifestyle/look-petal.jpg",
    w: 1376,
    h: 768,
    pins: [{ slug: "petal-kids-bed-nook", x: 58, y: 55 }],
  },
  {
    id: "dressing",
    title: { en: "The Dressing Room", ar: "غرفة الملابس" },
    mood: { en: "Walk-in · cove light & bouclé", ar: "غرفة ملابس · إضاءة مخفية وبوكليه" },
    image: "/images/lifestyle/look-dressing.jpg",
    w: 1376,
    h: 768,
    pins: [{ slug: "gallery-walk-in-closet", x: 25, y: 45 }],
  },
  {
    id: "study",
    title: { en: "Quiet Study", ar: "مكتب هادئ" },
    mood: { en: "Homework for two · daylight", ar: "واجبات لشخصين · ضوء النهار" },
    image: "/images/lifestyle/look-study.jpg",
    w: 1376,
    h: 768,
    pins: [{ slug: "study-nook-desk", x: 40, y: 66 }],
  },
  {
    id: "staircase",
    title: { en: "Staircase Hall", ar: "قاعة الدرج" },
    mood: { en: "Double height · oak, glass & steel", ar: "ارتفاع مزدوج · بلوط وزجاج وحديد" },
    image: "/images/lifestyle/look-staircase.jpg",
    w: 1376,
    h: 768,
    pins: [
      { slug: "black-steel-balustrade", x: 28, y: 14 },
      { slug: "understair-wine-storage", x: 53, y: 62 },
      { slug: "floating-oak-staircase", x: 82, y: 63 },
    ],
  },
  {
    id: "reading",
    title: { en: "Reading Lounge", ar: "ركن القراءة" },
    mood: { en: "Open plan · slats & afternoon sun", ar: "مساحة مفتوحة · شرائح وشمس العصر" },
    image: "/images/lifestyle/look-reading.jpg",
    w: 1376,
    h: 768,
    pins: [{ slug: "slatted-partition-console", x: 45, y: 68 }],
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

export const ROOM_KINDS: { id: RoomKind; en: string; ar: string }[] = [
  { id: "living", en: "Living", ar: "المعيشة" },
  { id: "bedroom", en: "Bedrooms", ar: "غرف النوم" },
  { id: "dining", en: "Dining", ar: "الطعام" },
  { id: "kids", en: "Kids & study", ar: "الأطفال والدراسة" },
  { id: "hall", en: "Hall & joinery", ar: "المداخل والنجارة" },
];
const ROOM_OF: Record<string, RoomKind> = {
  emerald: "living", library: "living", fireside: "living", harbour: "living", alba: "living",
  riviera: "living", sahara: "living", quiet: "living",
  blush: "bedroom", walnut: "bedroom", oak: "bedroom", atelier: "bedroom", guest: "bedroom", dressing: "bedroom",
  supper: "dining", petal: "kids", study: "kids", staircase: "hall", reading: "hall",
};
const HOME_LOOKS = new Set(["emerald", "supper", "library", "walnut", "sahara", "staircase"]);

/** The starting rooms, with pins pointed at the given catalogue's product ids. */
export function defaultLooks(products: Pick<Product, "id" | "slug">[], at = new Date().toISOString()): Look[] {
  const idOf = new Map(products.map((p) => [p.slug, p.id]));
  return DEFAULT_LOOKS.map(({ pins, ...look }) => ({
    ...look,
    pins: pins.flatMap((p) => (idOf.has(p.slug) ? [{ productId: idOf.get(p.slug)!, x: p.x, y: p.y }] : [])),
    room: ROOM_OF[look.id] ?? "living",
    home: HOME_LOOKS.has(look.id),
    live: true,
    createdAt: at,
  }));
}

export type ResolvedLook = Omit<Look, "pins"> & { pins: { product: Product; x: number; y: number }[] };

/** Live rooms with their pins resolved to live products (rooms left without pieces are skipped). */
export function resolveLooks(products: Product[], looks: Look[]): ResolvedLook[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return looks
    .filter((l) => l.live)
    .map(({ pins, ...look }) => ({
      ...look,
      pins: pins.flatMap((pin) => {
        const product = byId.get(pin.productId);
        return product ? [{ product, x: pin.x, y: pin.y }] : [];
      }),
    }))
    .filter((l) => l.pins.length > 0);
}

/** Room photos featuring a given product, for its gallery. */
export function roomsFor(productId: string, looks: Look[], lang: "en" | "ar") {
  return looks.flatMap((l) => {
    const pin = l.live ? l.pins.find((p) => p.productId === productId) : undefined;
    return pin ? [{ image: l.image, title: l.title[lang], x: pin.x, y: pin.y }] : [];
  });
}
