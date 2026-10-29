"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { PageHero } from "@/components/site/PageHero";
import { trackOrder } from "@/lib/actions";
import { money } from "@/lib/i18n";
import { EASE } from "@/components/ui/motion";
import type { OrderStatus } from "@/lib/types";

const FLOW: OrderStatus[] = ["new", "confirmed", "production", "delivery", "delivered"];

export function TrackView({ initial }: { initial: string }) {
  const { t, lang } = useSite();
  const [result, setResult] = useState<Awaited<ReturnType<typeof trackOrder>> | "none" | null>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <PageHero compact eyebrow={t("nav.track")} title={[t("track.title")]} sub={t("track.sub")} />
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl">
          <form
            action={(fd) =>
              start(async () => {
                const r = await trackOrder(String(fd.get("number")), String(fd.get("phone")));
                setResult(r ?? "none");
              })
            }
            className="grid gap-3 bg-plate p-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input name="number" defaultValue={initial} required placeholder={`${t("track.number")} · TNF-10001`} className="field bg-transparent" dir="ltr" />
            <input name="phone" required type="tel" placeholder={t("checkout.phone")} className="field bg-transparent" dir="ltr" />
            <button className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-ink px-6 font-medium text-white transition hover:bg-ink-2">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {t("track.find")}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {result === "none" && (
              <motion.p key="none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 flex items-center gap-3 rounded-2xl bg-red-50 p-5 font-semibold text-red-700">
                <X className="h-5 w-5" /> {t("track.notFound")}
              </motion.p>
            )}
            {result && result !== "none" && (
              <motion.div key={result.number} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ ease: EASE, duration: 0.6 }} className="mt-8 border border-line bg-white p-6 md:p-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink/50">{t("track.number")}</p>
                    <p className="font-display text-3xl font-semibold" dir="ltr">{result.number}</p>
                  </div>
                  <p className="text-2xl font-semibold">{money(result.total, lang)}</p>
                </div>

                {result.status === "cancelled" ? (
                  <p className="mt-8 rounded-2xl bg-red-50 p-5 font-medium text-red-700">{t("status.cancelled")}</p>
                ) : (
                  <ol className="relative mt-10 space-y-7">
                    <div className="absolute bottom-4 start-[19px] top-4 w-0.5 bg-ink/10" />
                    {FLOW.map((s, i) => {
                      const reached = FLOW.indexOf(result.status) >= i;
                      const at = result.history.find((h) => h.status === s)?.at;
                      return (
                        <motion.li key={s} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }} className="relative flex items-center gap-5">
                          <span className={clsx("relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition", reached ? "bg-brand" : "bg-plate ring-2 ring-ink/10")}>
                            {reached && <Check className="h-5 w-5" />}
                          </span>
                          <div>
                            <p className={clsx("font-medium", !reached && "text-ink/40")}>{t(`status.${s}`)}</p>
                            {at && <p className="text-sm text-ink/50">{new Date(at).toLocaleString(lang === "ar" ? "ar-AE" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>}
                          </div>
                        </motion.li>
                      );
                    })}
                  </ol>
                )}

                <div className="mt-10 flex flex-wrap gap-3 border-t border-ink/10 pt-6">
                  {result.items.map((i, k) => (
                    <div key={k} className="flex items-center gap-3 rounded-2xl bg-plate p-2 pe-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                        <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                      <span className="text-sm font-medium">{i.qty} × {i.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
