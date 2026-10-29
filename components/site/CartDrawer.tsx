"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useSite } from "@/components/providers";
import { cartTotal, useCart, useHydrated, useUI } from "@/lib/store";
import { money } from "@/lib/i18n";
import { EASE } from "@/components/ui/motion";
import { CircleArrow } from "@/components/ui/buttons";
import { lockScroll } from "./SmoothScroll";

export function CartDrawer() {
  const { t, lang, dir, settings } = useSite();
  const { cartOpen, setCart } = useUI();
  const { items, setQty, remove } = useCart();
  const hydrated = useHydrated();
  const list = hydrated ? items : [];
  const subtotal = cartTotal(list);
  const remaining = Math.max(0, settings.freeDeliveryOver - subtotal);
  const progress = Math.min(1, subtotal / settings.freeDeliveryOver);
  const from = dir === "rtl" ? "-100%" : "100%";

  useEffect(() => lockScroll(cartOpen), [cartOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCart(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCart]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[60] no-print" role="dialog" aria-modal aria-label={t("cart.title")}>
          <motion.div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCart(false)} />
          <motion.aside className="absolute inset-y-0 end-0 flex w-full max-w-[460px] flex-col bg-white" initial={{ x: from }} animate={{ x: 0 }} exit={{ x: from }} transition={{ duration: 0.6, ease: EASE }} data-lenis-prevent>
            <header className="flex h-16 items-center justify-between border-b border-line px-6">
              <h2 className="font-display text-[1.15rem] font-semibold">
                {t("cart.title")} <span className="font-normal text-muted">({list.reduce((s, i) => s + i.qty, 0)})</span>
              </h2>
              <button onClick={() => setCart(false)} className="flex h-10 w-10 items-center justify-center rounded-full transition hover:rotate-90 hover:bg-plate" aria-label={t("common.close")}>
                <X className="h-5 w-5 stroke-[1.5]" />
              </button>
            </header>

            {list.length > 0 && (
              <div className="border-b border-line px-6 py-4">
                <p className="mb-2.5 text-[0.85rem]">{remaining > 0 ? t("cart.away", { n: money(remaining, lang) }) : t("cart.free")}</p>
                <div className="h-[2px] bg-line">
                  <motion.div className="h-full bg-ink" initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {list.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-serif text-[1.8rem]">{t("cart.empty")}</p>
                  <p className="mt-2 text-[0.92rem] text-muted">{t("cart.emptyD")}</p>
                  <Link href="/shop" onClick={() => setCart(false)} className="mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-ink px-7 text-[0.92rem] font-medium text-white">
                    {t("cart.continue")} <CircleArrow />
                  </Link>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {list.map((i) => (
                      <motion.li key={i.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex gap-4 border-b border-line py-5">
                        <Link href={`/shop/${i.slug}`} onClick={() => setCart(false)} className="relative h-24 w-24 shrink-0 overflow-hidden bg-plate">
                          <Image src={i.image} alt="" fill sizes="96px" className="object-cover" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[0.95rem] leading-snug">{i.name[lang]}</p>
                            <span className="shrink-0 text-[0.92rem] font-medium">{money(i.price * i.qty, lang)}</span>
                          </div>
                          <p className="mt-0.5 text-[0.8rem] text-muted">{[i.finish, i.size].filter(Boolean).join(" · ")}</p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center rounded-full border border-line">
                              <button className="p-2" onClick={() => setQty(i.key, i.qty - 1)} aria-label="-"><Minus className="h-3.5 w-3.5" /></button>
                              <span className="w-6 text-center text-[0.88rem]">{i.qty}</span>
                              <button className="p-2" onClick={() => setQty(i.key, i.qty + 1)} aria-label="+"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                            <button onClick={() => remove(i.key)} className="link-u text-[0.8rem] text-muted hover:text-ink">{t("cart.remove")}</button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {list.length > 0 && (
              <footer className="border-t border-line px-6 py-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-[0.92rem] text-muted">{t("cart.subtotal")}</span>
                  <span className="text-[1.3rem] font-semibold">{money(subtotal, lang)}</span>
                </div>
                <Link href="/checkout" onClick={() => setCart(false)} className="flex h-[52px] items-center justify-center gap-3 rounded-full bg-ink text-[0.95rem] font-medium text-white transition hover:bg-ink-2">
                  {t("cart.checkout")} <CircleArrow />
                </Link>
                <button onClick={() => setCart(false)} className="mt-3 w-full text-center text-[0.85rem] text-muted hover:text-ink">{t("cart.continue")}</button>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
