"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Heart, Plus } from "lucide-react";
import { useId, useState } from "react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { useCart, useHydrated, useQuickView, useUI, useWishlist } from "@/lib/store";
import { money, tx } from "@/lib/i18n";
import type { Product } from "@/lib/types";

/** Short material line like "Bouclé • curved plywood" from the materials sentence. */
export function materialTags(p: Product, lang: "en" | "ar") {
  return tx(p.materials, lang)
    .split(/[,،]/)
    .map((x) => x.trim().split(" ").slice(0, 2).join(" "))
    .slice(0, 2)
    .join(" • ");
}

export function ProductCard({ product: p, priority = false, sizes }: { product: Product; priority?: boolean; sizes?: string }) {
  const { t, lang } = useSite();
  const uid = useId();
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const openQuickView = useQuickView((s) => s.open);
  const wish = useWishlist();
  const hydrated = useHydrated();
  const liked = hydrated && wish.ids.includes(p.id);
  const [added, setAdded] = useState(false);
  const [swatch, setSwatch] = useState(0);
  const price = p.salePrice || p.price;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0],
      price,
      finish: p.finishes[swatch] ? tx(p.finishes[swatch].name, "en") : undefined,
      size: p.sizes[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setTimeout(() => setCart(true), 350);
  };

  const imgSizes = sizes ?? "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw";

  return (
    <article className="group">
      <div className="relative">
      <Link href={`/shop/${p.slug}`} className="block" aria-label={tx(p.name, lang)}>
        <motion.div layoutId={`qv-${uid}`} className="relative aspect-square overflow-hidden bg-plate">
          <div className="absolute inset-0 transition-transform duration-[1600ms] ease-[cubic-bezier(.16,1,.3,1)] will-change-transform group-hover:scale-[1.07]">
            <Image src={p.images[0]} alt={tx(p.name, lang)} fill priority={priority} sizes={imgSizes} className="object-cover" />
          </div>
          {/* soft shade from the floor up, so the action bar reads on light plates */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        </motion.div>
      </Link>

      {/* Badges */}
      <div className="pointer-events-none absolute start-2 top-2 flex flex-wrap gap-1.5 md:start-3 md:top-3">
        {p.isNew && <Tag>{t("shop.new")}</Tag>}
        {p.salePrice && <Tag>−{Math.round((1 - p.salePrice / p.price) * 100)}%</Tag>}
        {p.featured && !p.isNew && !p.salePrice && <Tag>{lang === "ar" ? "الأكثر طلباً" : "Bestseller"}</Tag>}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => wish.toggle(p.id)}
        className={clsx(
          "absolute end-2 top-2 flex h-8 w-8 items-center md:end-3 md:top-3 md:h-9 md:w-9 justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all duration-500",
          liked ? "scale-100 opacity-100" : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 max-md:scale-100 max-md:opacity-100"
        )}
        aria-label="Wishlist"
        aria-pressed={liked}
      >
        <motion.span animate={liked ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.35 }}>
          <Heart className={clsx("h-4 w-4 stroke-[1.5]", liked && "fill-ink")} />
        </motion.span>
      </button>

      {/* Desktop action bar: slides up in two beats */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden gap-2 md:flex">
        <button
          onClick={() => openQuickView(p, uid)}
          className="pointer-events-auto flex h-10 flex-1 translate-y-3 items-center justify-center gap-2 bg-white/95 text-[0.8rem] font-medium opacity-0 shadow-sm backdrop-blur transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-white group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye className="h-4 w-4 stroke-[1.5]" /> {lang === "ar" ? "عرض سريع" : "Quick view"}
        </button>
        {p.priceOnRequest ? (
          <Link
            href={`/quote?service=custom&product=${encodeURIComponent(p.name.en)}`}
            className="pointer-events-auto flex h-10 flex-1 translate-y-3 items-center justify-center bg-ink text-[0.8rem] font-medium text-white opacity-0 transition-all delay-[60ms] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-ink-2 group-hover:translate-y-0 group-hover:opacity-100"
          >
            {t("shop.request")}
          </Link>
        ) : (
          <button
            onClick={quickAdd}
            className="pointer-events-auto flex h-10 flex-1 translate-y-3 items-center justify-center gap-2 bg-ink text-[0.8rem] font-medium text-white opacity-0 transition-all delay-[60ms] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-ink-2 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={String(added)} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="flex items-center gap-2">
                {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {added ? t("shop.added") : lang === "ar" ? "أضف للحقيبة" : "Add to bag"}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
      </div>

      {/* Mobile: compact add button */}
      {!p.priceOnRequest && (
        <button onClick={quickAdd} className="absolute bottom-2 end-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm md:hidden" aria-label={t("v2.quickAdd")}>
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      )}

      </div>

      {/* Info — phones and tablets stack name over price; desktop sets them side by side */}
      <div className="pt-3 lg:pt-4">
        <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between lg:gap-3">
          <Link href={`/shop/${p.slug}`} className="line-clamp-2 text-[0.88rem] leading-snug transition-colors hover:text-ink-2 lg:line-clamp-none lg:text-[0.95rem]">
            {tx(p.name, lang)}
          </Link>
          <span className="flex items-baseline gap-2 text-[0.85rem] font-medium tabular-nums lg:shrink-0 lg:text-[0.9rem]">
            {p.priceOnRequest ? <span className="font-normal text-muted">{t("shop.onRequest")}</span> : money(price, lang)}
            {p.salePrice && <span className="text-[0.75rem] font-normal text-faint line-through lg:hidden">{money(p.price, lang)}</span>}
          </span>
        </div>
        <div className="mt-1 flex items-start justify-between gap-3">
          <p className="truncate text-[0.75rem] text-muted lg:whitespace-normal lg:text-[0.8rem]">{materialTags(p, lang)}</p>
          {p.salePrice && <span className="hidden shrink-0 text-[0.78rem] text-faint line-through tabular-nums lg:inline">{money(p.price, lang)}</span>}
        </div>
        {p.finishes.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 lg:mt-3">
            {p.finishes.slice(0, 5).map((f, i) => (
              <button
                key={i}
                onClick={() => setSwatch(i)}
                title={tx(f.name, lang)}
                aria-label={tx(f.name, lang)}
                className={clsx("h-3.5 w-3.5 rounded-full ring-offset-2 transition-all duration-300 hover:scale-125", swatch === i ? "ring-1 ring-ink" : "ring-1 ring-black/10")}
                style={{ background: f.hex }}
              />
            ))}
            {p.finishes.length > 5 && <span className="ms-1 text-[0.75rem] text-muted">+{p.finishes.length - 5}</span>}
          </div>
        )}
      </div>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="bg-white/90 px-1.5 py-0.5 text-[0.64rem] font-medium tracking-wide text-ink backdrop-blur md:px-2 md:py-1 md:text-[0.7rem]">{children}</span>;
}
