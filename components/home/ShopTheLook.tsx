"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { useCart, useQuickView, useUI } from "@/lib/store";
import { money, tx } from "@/lib/i18n";
import { EASE, Reveal, SplitLines } from "@/components/ui/motion";
import { ArrowLink } from "@/components/ui/buttons";
import type { ResolvedLook } from "@/lib/looks";

export type { ResolvedLook };

export function ShopTheLook({ looks, standalone = false }: { looks: ResolvedLook[]; standalone?: boolean }) {
  const { t, lang } = useSite();
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const [i, setI] = useState(0);
  const look = looks[i];
  const [active, setActive] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  // New look: select every buyable piece by default.
  useEffect(() => {
    setPicked(new Set(look.pins.filter((p) => !p.product.priceOnRequest).map((p) => p.product.id)));
    setActive(null);
  }, [look]);

  const activePin = look.pins.find((p) => p.product.id === active);
  const total = useMemo(
    () => look.pins.filter((p) => picked.has(p.product.id)).reduce((s, p) => s + (p.product.salePrice || p.product.price), 0),
    [look, picked]
  );

  const toggle = (id: string) =>
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const addLook = () => {
    look.pins
      .filter((p) => picked.has(p.product.id))
      .forEach(({ product: p }) =>
        add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], price: p.salePrice || p.price, finish: p.finishes[0] ? tx(p.finishes[0].name, "en") : undefined, size: p.sizes[0] })
      );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setTimeout(() => setCart(true), 450);
  };

  return (
    <section className={clsx(standalone ? "py-10 md:py-14" : "py-12 md:py-24")}>
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        {!standalone && (
          <div className="mb-6 flex items-end justify-between gap-6 md:mb-10">
            <div>
              <Reveal><p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{lang === "ar" ? "تسوّق الإطلالة" : "Shop the look"}</p></Reveal>
              <h2 className="mt-1 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
                <SplitLines lines={[lang === "ar" ? "غرف حقيقية، قطع حقيقية" : "Real rooms, real pieces"]} />
              </h2>
            </div>
            <Reveal delay={0.1} className="hidden md:block"><ArrowLink href="/inspiration">{lang === "ar" ? "كل الإلهامات" : "All inspiration"}</ArrowLink></Reveal>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          {/* Room */}
          <div className="-mx-5 min-w-0 md:mx-0 lg:col-span-8">
            <div className="relative overflow-hidden bg-plate" style={{ aspectRatio: `${look.w}/${look.h}` }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={look.id}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(0 0 0 100%)" }}
                  animate={{ clipPath: "inset(0 0 0 0%)" }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 1.1, ease: EASE }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ scale: activePin ? 1.07 : 1 }}
                    style={{ transformOrigin: activePin ? `${activePin.x}% ${activePin.y}%` : "50% 50%" }}
                    transition={{ duration: 1.2, ease: EASE }}
                  >
                    <Image src={look.image} alt={tx(look.title, lang)} fill sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />
                  </motion.div>
                  <div className={clsx("pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-700", activePin && "bg-black/10")} />
                </motion.div>
              </AnimatePresence>

              {look.pins.map((pin, k) => (
                <LookPin key={`${look.id}-${pin.product.id}`} pin={pin} lookId={look.id} index={k} active={active} setActive={setActive} />
              ))}

              <span className="pointer-events-none absolute bottom-4 start-4 bg-white/90 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] backdrop-blur">
                {lang === "ar" ? `${look.pins.length} قطع من تنفيذ` : `${look.pins.length} TANFEEZ pieces`}
              </span>
            </div>
          </div>

          {/* Panel */}
          <div className="flex min-w-0 flex-col lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div key={look.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6, ease: EASE }} className="flex flex-1 flex-col">
                <p className="hidden text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted lg:block">{lang === "ar" ? "الإطلالة" : "The look"}</p>
                <h3 className="mt-2 font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-semibold leading-[1.05] tracking-[-0.025em]">{tx(look.title, lang)}</h3>
                <p className="mt-1.5 font-serif text-[1.05rem] leading-relaxed text-ink-2 lg:mt-3 lg:text-[1.1rem]">{tx(look.mood, lang)}</p>

                {/* Phones: the pieces as a swipeable row */}
                <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 lg:hidden">
                  {look.pins.map(({ product: p }) => {
                    const on = picked.has(p.id);
                    return (
                      <div key={p.id} className={clsx("flex w-[240px] shrink-0 items-center gap-3 rounded-xl border p-2 transition-colors", on ? "border-ink/30" : "border-line")}>
                        <Link href={`/shop/${p.slug}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-plate">
                          <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />
                        </Link>
                        <Link href={`/shop/${p.slug}`} className="min-w-0 flex-1">
                          <span className="block truncate text-[0.85rem]">{tx(p.name, lang)}</span>
                          <span className="block text-[0.78rem] text-muted tabular-nums">{p.priceOnRequest ? t("shop.onRequest") : money(p.salePrice || p.price, lang)}</span>
                        </Link>
                        {!p.priceOnRequest && (
                          <button onClick={() => toggle(p.id)} className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition", on ? "border-ink bg-ink text-white" : "border-ink/25")} aria-label="Select" aria-pressed={on}>
                            {on && <Check className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <ul className="mt-6 hidden border-t border-line lg:block">
                  {look.pins.map(({ product: p }) => {
                    const on = picked.has(p.id);
                    return (
                      <li
                        key={p.id}
                        onPointerEnter={() => setActive(p.id)}
                        onPointerLeave={() => setActive(null)}
                        className={clsx("flex items-center gap-4 border-b border-line py-3 transition-colors", active === p.id && "bg-plate/60")}
                      >
                        <button
                          onClick={() => !p.priceOnRequest && toggle(p.id)}
                          disabled={p.priceOnRequest}
                          className={clsx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition", on ? "border-ink bg-ink text-white" : "border-ink/25", p.priceOnRequest && "opacity-30")}
                          aria-label="Select"
                          aria-pressed={on}
                        >
                          {on && <Check className="h-3 w-3" />}
                        </button>
                        <Link href={`/shop/${p.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden bg-plate">
                          <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover transition duration-700 hover:scale-110" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/shop/${p.slug}`} className="block truncate text-[0.92rem] hover:underline">{tx(p.name, lang)}</Link>
                          <p className="text-[0.8rem] text-muted tabular-nums">{p.priceOnRequest ? t("shop.onRequest") : money(p.salePrice || p.price, lang)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-auto pt-5 lg:pt-6">
                  {look.pins.some((p) => !p.product.priceOnRequest) ? (
                    <>
                      <div className="mb-4 flex items-baseline justify-between">
                        <span className="text-[0.88rem] text-muted">{lang === "ar" ? `${picked.size} قطع مختارة` : `${picked.size} selected`}</span>
                        <motion.span key={total} initial={{ opacity: 0.3, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[1.3rem] font-semibold tabular-nums">{money(total, lang)}</motion.span>
                      </div>
                      <button onClick={addLook} disabled={picked.size === 0} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.92rem] font-medium text-white transition hover:bg-ink-2 disabled:opacity-40">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={String(added)} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4 stroke-[1.5]" />}
                            {added ? t("shop.added") : lang === "ar" ? "أضف الإطلالة للحقيبة" : "Add the look to bag"}
                          </motion.span>
                        </AnimatePresence>
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mb-4 text-[0.88rem] text-muted">{lang === "ar" ? "مصنوع حسب المقاس · السعر عند الطلب" : "Made to measure · price on request"}</p>
                      <Link href={`/quote?service=custom&product=${encodeURIComponent(tx(look.title, "en"))}`} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.92rem] font-medium text-white transition hover:bg-ink-2">
                        {lang === "ar" ? "اطلب عرض سعر لهذه الغرفة" : "Request a quote for this room"}
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Look selector */}
        {looks.length > 1 && (
          <div className="no-scrollbar -mx-5 mt-6 flex gap-2.5 overflow-x-auto px-5 md:mx-0 md:mt-8 md:gap-3 md:px-0">
            {looks.map((l, k) => (
              <button key={l.id} onClick={() => setI(k)} className="group w-[124px] shrink-0 text-start md:w-56">
                <span className="relative block aspect-[16/9] overflow-hidden bg-plate">
                  <Image src={l.image} alt="" fill sizes="224px" className={clsx("object-cover transition duration-700 group-hover:scale-105", k !== i && "opacity-60 group-hover:opacity-100")} />
                </span>
                <span className="mt-2 flex items-center gap-2 text-[0.85rem]">
                  <span className={clsx("h-px transition-all duration-500", k === i ? "w-6 bg-ink" : "w-0 bg-transparent")} />
                  <span className={k === i ? "text-ink" : "text-muted group-hover:text-ink"}>{tx(l.title, lang)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type Pin = ResolvedLook["pins"][number];

/** A pulsing "+" on a room photo that morphs into a name/price pill; click opens QuickView. */
export function LookPin({ pin, lookId, index, active, setActive, delay = 0.7 }: { pin: Pin; lookId: string; index: number; active: string | null; setActive: (id: string | null) => void; delay?: number }) {
  const { t, lang } = useSite();
  const openQuickView = useQuickView((s) => s.open);
  const on = active === pin.product.id;
  const dim = active && !on;
  const flip = pin.x > 62;
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: dim ? 0.45 : 1 }}
      transition={{ delay: delay + index * 0.12, type: "spring", stiffness: 260, damping: 20 }}
      className="absolute z-10"
      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(pin.product.id)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
      onClick={() => (on || window.matchMedia("(pointer: fine)").matches ? openQuickView(pin.product, `look-${lookId}-${pin.product.id}`) : setActive(pin.product.id))}
      aria-label={tx(pin.product.name, lang)}
    >
      <span className="relative block -translate-x-1/2 -translate-y-1/2">
        {!on && <span className="absolute inset-0 animate-ping rounded-full bg-white/60" />}
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className={clsx("relative flex h-8 items-center overflow-hidden rounded-full bg-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)]", on ? "gap-2.5 ps-1 pe-4" : "w-8 justify-center", flip && on && "flex-row-reverse ps-4 pe-1")}
        >
          <span className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", on ? "bg-ink text-white" : "")}>
            <Plus className="h-3.5 w-3.5" />
          </span>
          {on && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="whitespace-nowrap text-[0.8rem]">
              <span className="font-medium">{tx(pin.product.name, lang)}</span>
              <span className="ms-2 text-muted tabular-nums">{pin.product.priceOnRequest ? t("shop.onRequest") : money(pin.product.salePrice || pin.product.price, lang)}</span>
            </motion.span>
          )}
        </motion.span>
      </span>
    </motion.button>
  );
}
