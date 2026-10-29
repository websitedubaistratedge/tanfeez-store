"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { ArrowDownUp, Check, SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "./ProductCard";
import { money, tx } from "@/lib/i18n";
import type { Category, Product, Project } from "@/lib/types";
import { EASE } from "@/components/ui/motion";
import { ArrowLink } from "@/components/ui/buttons";
import { useHydrated, useWishlist } from "@/lib/store";
import { lockScroll } from "@/components/site/SmoothScroll";

type Sort = "featured" | "newest" | "low" | "high";
const PRICES = [
  { id: "u5", min: 0, max: 5000 },
  { id: "5-10", min: 5000, max: 10000 },
  { id: "10-15", min: 10000, max: 15000 },
  { id: "15", min: 15000, max: Infinity },
] as const;

export function ShopView({
  products,
  categories,
  editorial,
  initialCategory,
  initialQuery,
  wishlistOnly,
}: {
  products: Product[];
  categories: Category[];
  editorial: Project[];
  initialCategory: string;
  initialQuery: string;
  wishlistOnly?: boolean;
}) {
  const { t, lang } = useSite();
  const ar = lang === "ar";
  const wish = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const [cat, setCat] = useState(initialCategory);
  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState<Sort>("featured");
  const [inStock, setInStock] = useState(false);
  const [madeToOrder, setMadeToOrder] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  const [colour, setColour] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [onlyWish, setOnlyWish] = useState(!!wishlistOnly);

  useEffect(() => lockScroll(sheet), [sheet]);

  const colours = useMemo(() => {
    const m = new Map<string, { hex: string; name: string }>();
    products.forEach((p) => p.finishes.forEach((f) => m.set(f.hex, { hex: f.hex, name: tx(f.name, lang) })));
    return [...m.values()].slice(0, 16);
  }, [products, lang]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const band = PRICES.find((b) => b.id === price);
    const eff = (p: Product) => (p.priceOnRequest ? Infinity : p.salePrice || p.price);
    return products
      .filter((p) => {
        if (onlyWish && hydrated && !wish.includes(p.id)) return false;
        if (cat !== "all" && p.category !== cat) return false;
        if (inStock && (p.priceOnRequest || p.stock <= 0)) return false;
        if (madeToOrder && !p.priceOnRequest) return false;
        if (band && (p.priceOnRequest || eff(p) < band.min || eff(p) >= band.max)) return false;
        if (colour && !p.finishes.some((f) => f.hex === colour)) return false;
        if (needle && ![p.name.en, p.name.ar, p.description.en, p.description.ar, p.category].join(" ").toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "low") return eff(a) - eff(b);
        if (sort === "high") return (b.priceOnRequest ? -1 : eff(b)) - (a.priceOnRequest ? -1 : eff(a));
        if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
        return Number(b.featured) - Number(a.featured);
      });
  }, [products, cat, q, sort, inStock, madeToOrder, price, colour, onlyWish, wish, hydrated]);

  const selectCat = (slug: string) => {
    setCat(slug);
    try {
      const url = new URL(window.location.href);
      if (slug === "all") url.searchParams.delete("c");
      else url.searchParams.set("c", slug);
      window.history.replaceState(null, "", url);
    } catch {}
  };
  const activeCount = [inStock, madeToOrder, !!price, !!colour, onlyWish].filter(Boolean).length;
  const clearAll = () => {
    setInStock(false);
    setMadeToOrder(false);
    setPrice(null);
    setColour(null);
    setOnlyWish(false);
    setQ("");
  };

  const current = categories.find((c) => c.slug === cat);
  const priceLabel = (b: (typeof PRICES)[number]) =>
    b.max === Infinity ? `${money(b.min, lang)}+` : b.min === 0 ? `< ${money(b.max, lang)}` : `${money(b.min, lang)} – ${money(b.max, lang)}`;

  // Build grid with an editorial tile after every 8 products
  const cells: ({ kind: "p"; p: Product; i: number } | { kind: "e"; e: Project; k: number })[] = [];
  list.forEach((p, i) => {
    cells.push({ kind: "p", p, i });
    const k = Math.floor((i + 1) / 8) - 1;
    if ((i + 1) % 8 === 0 && editorial[k] && i < list.length - 1) cells.push({ kind: "e", e: editorial[k], k });
  });

  return (
    <>
      {/* Phones: a compact title and story-style category circles instead of the tall band */}
      <div className="pt-5 md:hidden">
        <div className="flex items-end justify-between gap-4 px-5">
          <h1 className="font-display text-[1.9rem] font-semibold leading-none tracking-[-0.03em]">
            {onlyWish ? (ar ? "المفضلة" : "Your wishlist") : current ? tx(current.name, lang) : ar ? "المتجر" : "Shop"}
          </h1>
          <span className="pb-0.5 text-[0.8rem] text-muted tabular-nums">{list.length} {t("v2.items")}</span>
        </div>
        <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto px-5 pb-1">
          {[{ id: "all", slug: "all", name: { en: "All", ar: "الكل" }, image: "/images/lifestyle/hero.jpg" }, ...categories].map((c) => (
            <button key={c.slug} onClick={() => selectCat(c.slug)} className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
              <span className={clsx("relative block h-[60px] w-[60px] overflow-hidden rounded-full bg-plate ring-offset-2 transition", cat === c.slug ? "ring-[1.5px] ring-ink" : "ring-1 ring-line")}>
                <Image src={c.image} alt="" fill sizes="60px" className="object-cover" />
              </span>
              <span className={clsx("w-full truncate text-center text-[0.72rem] leading-tight", cat === c.slug ? "font-medium text-ink" : "text-ink/60")}>{tx(c.name, lang).replace(/ & .*/, "")}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
      <PageHero
        overlap
        back={{ href: "/", label: t("nav.home") }}
        eyebrow={current ? tx(current.blurb, lang) : t("shop.sub")}
        title={[onlyWish ? (ar ? "المفضلة" : "Your wishlist") : current ? tx(current.name, lang) : t("shop.title")]}
      />

      {/* Category image strip overlapping the band */}
      <div className="relative -mt-24 md:-mt-28">
        <div className="no-scrollbar mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-5 md:px-10">
          {[{ id: "all", slug: "all", name: { en: "All furniture", ar: "كل الأثاث" }, image: "/images/lifestyle/hero.jpg" }, ...categories].map((c, i) => (
            <motion.button
              key={c.slug}
              onClick={() => selectCat(c.slug)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.04, duration: 0.7, ease: EASE }}
              className="group w-[38vw] shrink-0 text-start sm:w-[180px] lg:w-[min(11vw,170px)]"
            >
              <div className={clsx("relative aspect-square overflow-hidden bg-plate ring-offset-2 transition", cat === c.slug ? "ring-1 ring-ink" : "")}>
                <Image src={c.image} alt="" fill sizes="180px" className="object-cover transition duration-1000 group-hover:scale-105" />
              </div>
              <p className={clsx("mt-2 text-[0.85rem] transition", cat === c.slug ? "text-ink" : "text-ink/60 group-hover:text-ink")}>{tx(c.name, lang)}</p>
            </motion.button>
          ))}
        </div>
      </div>

      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-30 mt-4 border-y border-line bg-white/95 backdrop-blur md:mt-10">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-5 py-2.5 md:px-10 md:py-3">
          <button onClick={() => setSheet(true)} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-[0.88rem] font-medium text-white">
            <SlidersHorizontal className="h-4 w-4 stroke-[1.5]" />
            {t("v2.allFilters")}
            {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-semibold text-ink">{activeCount}</span>}
          </button>
          <div className="no-scrollbar hidden flex-1 gap-2 overflow-x-auto md:flex">
            <Chip on={inStock} onClick={() => setInStock((v) => !v)}>{t("shop.inStock")}</Chip>
            <Chip on={madeToOrder} onClick={() => setMadeToOrder((v) => !v)}>{t("shop.madeToOrder")}</Chip>
            {PRICES.map((b) => (
              <Chip key={b.id} on={price === b.id} onClick={() => setPrice(price === b.id ? null : b.id)}>{priceLabel(b)}</Chip>
            ))}
          </div>
          <span className="ms-auto hidden shrink-0 text-[0.85rem] text-muted sm:block">
            {list.length} {t("v2.items")}
          </span>
          <label className="relative ms-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line ps-4 pe-3 text-[0.88rem] sm:ms-3">
            <ArrowDownUp className="h-4 w-4 stroke-[1.5]" />
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="cursor-pointer appearance-none bg-transparent pe-1 outline-none" aria-label={t("shop.sort")}>
              <option value="featured">{t("shop.featured")}</option>
              <option value="newest">{t("shop.newest")}</option>
              <option value="low">{t("shop.priceLow")}</option>
              <option value="high">{t("shop.priceHigh")}</option>
            </select>
          </label>
        </div>
      </div>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-5 md:px-10 md:pb-24 md:pt-8">
        {q && (
          <p className="mb-6 text-[0.95rem] text-muted">
            “{q}” · <button onClick={() => setQ("")} className="underline">{t("v2.clear")}</button>
          </p>
        )}
        {list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mx-auto max-w-md font-serif text-[1.6rem] leading-snug">{t("shop.empty")}</p>
            <div className="mt-6 flex justify-center gap-6">
              <button onClick={clearAll} className="link-u text-[0.95rem]">{t("v2.clear")}</button>
              <ArrowLink href="/quote?service=custom">{t("shop.request")}</ArrowLink>
            </div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-2 md:gap-y-10 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {cells.map((c) =>
                c.kind === "p" ? (
                  <motion.div key={c.p.id} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE, delay: Math.min(c.i % 8, 7) * 0.04 }}>
                    <ProductCard product={c.p} priority={c.i < 4} />
                  </motion.div>
                ) : (
                  <motion.div key={`e-${c.e.id}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-2 hidden md:col-span-2 md:block xl:row-span-1">
                    <Link href={`/projects/${c.e.slug}`} className="group relative block h-full min-h-[280px] overflow-hidden bg-plate">
                      <Image src={c.e.images[0]?.src} alt={c.e.client} fill sizes="50vw" className="object-cover transition duration-[1.4s] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 start-0 p-5 text-white md:p-7">
                        <p className="font-serif text-[1.3rem] leading-none">{t("v2.projectsSerif")}</p>
                        <p className="mt-1 font-display text-[1.6rem] font-semibold tracking-tight">{c.e.client}</p>
                        <p className="mt-1 text-[0.85rem] text-white/80">{tx(c.e.location, lang)}</p>
                      </div>
                    </Link>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Filter sheet */}
      <AnimatePresence>
        {sheet && (
          <div className="fixed inset-0 z-[60]" role="dialog" aria-modal>
            <motion.div className="absolute inset-0 bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.aside
              className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-white max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:h-[88vh] max-sm:max-w-none max-sm:rounded-t-2xl"
              initial={{ x: ar ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: ar ? "-100%" : "100%" }}
              transition={{ duration: 0.55, ease: EASE }}
              data-lenis-prevent
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-6">
                <p className="font-display text-[1.2rem] font-semibold">{t("v2.allFilters")}</p>
                <button onClick={() => setSheet(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-plate" aria-label={t("common.close")}><X className="h-5 w-5 stroke-[1.5]" /></button>
              </div>
              <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                <Group title={t("shop.sort")}>
                  {(["featured", "newest", "low", "high"] as Sort[]).map((s) => (
                    <Row key={s} on={sort === s} onClick={() => setSort(s)}>
                      {t(({ featured: "shop.featured", newest: "shop.newest", low: "shop.priceLow", high: "shop.priceHigh" } as const)[s])}
                    </Row>
                  ))}
                </Group>
                <Group title={ar ? "الفئة" : "Category"}>
                  <Row on={cat === "all"} onClick={() => selectCat("all")}>{t("shop.all")}</Row>
                  {categories.map((c) => (
                    <Row key={c.slug} on={cat === c.slug} onClick={() => selectCat(c.slug)}>{tx(c.name, lang)}</Row>
                  ))}
                </Group>
                <Group title={ar ? "السعر" : "Price"}>
                  {PRICES.map((b) => (
                    <Row key={b.id} on={price === b.id} onClick={() => setPrice(price === b.id ? null : b.id)}>{priceLabel(b)}</Row>
                  ))}
                </Group>
                <Group title={ar ? "اللون" : "Colour"}>
                  <div className="flex flex-wrap gap-2.5">
                    {colours.map((c) => (
                      <button key={c.hex} onClick={() => setColour(colour === c.hex ? null : c.hex)} title={c.name} aria-label={c.name} className={clsx("h-9 w-9 rounded-full ring-1 ring-black/10 ring-offset-2 transition", colour === c.hex && "ring-2 ring-ink")} style={{ background: c.hex }} />
                    ))}
                  </div>
                </Group>
                <Group title={ar ? "التوفر" : "Availability"}>
                  <Row on={inStock} onClick={() => setInStock((v) => !v)}>{t("shop.inStock")}</Row>
                  <Row on={madeToOrder} onClick={() => setMadeToOrder((v) => !v)}>{t("shop.madeToOrder")}</Row>
                  <Row on={onlyWish} onClick={() => setOnlyWish((v) => !v)}>{ar ? "المفضلة فقط" : "Wishlist only"}</Row>
                </Group>
              </div>
              <div className="flex gap-3 border-t border-line p-5">
                <button onClick={clearAll} className="h-12 flex-1 rounded-full border border-line text-[0.92rem] font-medium">{t("v2.clear")}</button>
                <button onClick={() => setSheet(false)} className="h-12 flex-[2] rounded-full bg-ink text-[0.92rem] font-medium text-white">
                  {t("v2.apply")} ({list.length})
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={clsx("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[0.88rem] transition", on ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
      {on && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between py-2 text-start text-[0.95rem]">
      <span className={on ? "font-medium" : "text-ink/75"}>{children}</span>
      <span className={clsx("flex h-5 w-5 items-center justify-center rounded-full border transition", on ? "border-ink bg-ink text-white" : "border-line")}>{on && <Check className="h-3 w-3" />}</span>
    </button>
  );
}
