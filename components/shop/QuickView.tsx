"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Clock, Minus, Plus, Truck, X } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { useCart, useQuickView, useUI } from "@/lib/store";
import { money, tx } from "@/lib/i18n";
import { EASE } from "@/components/ui/motion";
import { CircleArrow } from "@/components/ui/buttons";
import { lockScroll } from "@/components/site/SmoothScroll";

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.18 + i * 0.05, duration: 0.6, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
});

export function QuickView() {
  const { t, lang } = useSite();
  const { product: p, source, close } = useQuickView();
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const [finish, setFinish] = useState(0);
  const [size, setSize] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    lockScroll(!!p);
    if (p) {
      setFinish(0);
      setSize(0);
      setQty(1);
      setAdded(false);
    }
  }, [p]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const price = p ? p.salePrice || p.price : 0;
  const onAdd = () => {
    if (!p) return;
    add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], price, finish: p.finishes[finish] ? tx(p.finishes[finish].name, "en") : undefined, size: p.sizes[size] }, qty);
    setAdded(true);
    setTimeout(() => {
      close();
      setTimeout(() => setCart(true), 450);
    }, 700);
  };

  return (
    <AnimatePresence>
      {p && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-6 lg:p-10" role="dialog" aria-modal aria-label={tx(p.name, lang)}>
          <motion.div className="absolute inset-0 bg-ink/35 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={close} />

          <div className="relative grid w-full max-w-[1080px] grid-cols-[1.05fr_1fr]">
            {/* white panel fades in behind the morphing image */}
            <motion.div className="absolute inset-0 bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.35)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }} />

            <motion.div layoutId={source ? `qv-${source}` : undefined} transition={{ duration: 0.7, ease: EASE }} className="relative aspect-square overflow-hidden bg-plate">
              <Image src={p.images[0]} alt={tx(p.name, lang)} fill sizes="540px" className="object-cover" priority />
            </motion.div>

            <div className="relative flex max-h-[min(540px,80vh)] flex-col overflow-y-auto p-8 lg:p-10" data-lenis-prevent>
              <motion.p {...stagger(0)} className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">
                {p.isNew ? t("shop.new") : p.featured ? (lang === "ar" ? "الأكثر طلباً" : "Bestseller") : t("shop.madeInUAE")}
              </motion.p>
              <motion.h2 {...stagger(1)} className="mt-2 font-display text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.025em]">
                {tx(p.name, lang)}
              </motion.h2>
              <motion.div {...stagger(2)} className="mt-3 flex items-baseline gap-3">
                {p.priceOnRequest ? (
                  <span className="text-[1.15rem]">{t("shop.onRequest")}</span>
                ) : (
                  <>
                    <span className="text-[1.3rem] font-semibold tabular-nums">{money(price, lang)}</span>
                    {p.salePrice && <span className="text-faint line-through">{money(p.price, lang)}</span>}
                    <span className="text-[0.78rem] text-muted">{t("shop.vatIncl")}</span>
                  </>
                )}
              </motion.div>
              <motion.p {...stagger(3)} className="mt-4 line-clamp-3 font-serif text-[1.08rem] leading-relaxed text-ink-2">
                {tx(p.description, lang)}
              </motion.p>

              {p.finishes.length > 0 && (
                <motion.div {...stagger(4)} className="mt-6">
                  <p className="mb-2.5 text-[0.85rem]">
                    {t("shop.finish")}: <span className="text-muted">{tx(p.finishes[finish]?.name, lang)}</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {p.finishes.map((f, i) => (
                      <button key={i} onClick={() => setFinish(i)} aria-label={tx(f.name, lang)} className={clsx("h-8 w-8 rounded-full ring-offset-[3px] transition", finish === i ? "ring-[1.5px] ring-ink" : "ring-1 ring-black/10 hover:scale-110")} style={{ background: f.hex }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {p.sizes.length > 1 && (
                <motion.div {...stagger(5)} className="mt-5 flex flex-wrap gap-2">
                  {p.sizes.map((s, i) => (
                    <button key={s} onClick={() => setSize(i)} className={clsx("h-9 rounded-full border px-4 text-[0.82rem] transition", size === i ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              <motion.div {...stagger(6)} className="mt-auto pt-7">
                {p.priceOnRequest ? (
                  <Link href={`/quote?service=custom&product=${encodeURIComponent(p.name.en)}`} onClick={close} className="flex h-12 items-center justify-center rounded-full bg-ink text-[0.92rem] font-medium text-white">
                    {t("shop.request")}
                  </Link>
                ) : (
                  <div className="flex gap-2.5">
                    <div className="flex h-12 items-center rounded-full border border-line">
                      <button className="px-3.5" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-5 text-center text-[0.92rem] tabular-nums">{qty}</span>
                      <button className="px-3.5" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="+"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={onAdd} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[0.92rem] font-medium text-white transition hover:bg-ink-2">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={String(added)} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2 whitespace-nowrap">
                          {added && <Check className="h-4 w-4" />}
                          {added ? t("shop.added") : `${lang === "ar" ? "أضف للحقيبة" : "Add to bag"} · ${money(price * qty, lang)}`}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-[0.8rem] text-muted">
                  <span className="flex items-center gap-1.5">
                    {p.priceOnRequest ? <Truck className="h-4 w-4 stroke-[1.5]" /> : <Clock className="h-4 w-4 stroke-[1.5]" />}
                    {p.priceOnRequest ? t("shop.madeToOrder") : t("shop.leadTime", { n: p.leadTimeDays })}
                  </span>
                  <Link href={`/shop/${p.slug}`} onClick={close} className="group flex items-center gap-2 text-ink">
                    <span className="link-u">{lang === "ar" ? "كل التفاصيل" : "Full details"}</span>
                    <CircleArrow className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            </div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition hover:rotate-90 hover:bg-plate"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5 stroke-[1.5]" />
            </motion.button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
