"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { useCart, useUI } from "@/lib/store";
import { money, tx } from "@/lib/i18n";
import { EASE } from "@/components/ui/motion";
import { PageHero } from "@/components/site/PageHero";
import { CircleArrow } from "@/components/ui/buttons";
import { LookPin, type ResolvedLook } from "@/components/home/ShopTheLook";
import { ROOM_KINDS } from "@/lib/looks";
import { quickLine } from "@/lib/configurator";
import { useUrlState } from "@/lib/url-state";
import { BackButton } from "@/components/ui/BackButton";

// A whisper of each room's palette behind its story panel.
const TINT: Record<string, string> = {
  emerald: "#EEF1EC", library: "#F4EDE4", blush: "#F8EFEC", fireside: "#EFEAE5", quiet: "#F3F2F0",
  harbour: "#EDF1F4", alba: "#F3F0EA", riviera: "#F1F0EC", sahara: "#F4ECE3", supper: "#F2EDE6",
  walnut: "#F3EEE8", oak: "#F4F2EE", atelier: "#EEEFF2", guest: "#F4EFE7", petal: "#F8F0EF",
  dressing: "#F3F1EE", study: "#F1F2F0", staircase: "#F2F0EC", reading: "#F4F0E9",
};

export function InspirationView({ looks }: { looks: ResolvedLook[] }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const [kind, setKind] = useUrlState<string>("room", "all");
  // One room open at a time (?look=id); Back returns to the grid.
  const [lookId, setLookId] = useUrlState<string>("look", "", ["", ...looks.map((l) => l.id)]);
  const shown = kind === "all" ? looks : looks.filter((l) => l.room === kind);
  const open = looks.find((l) => l.id === lookId);
  const pieces = new Set(looks.flatMap((l) => l.pins.map((p) => p.product.id))).size;
  const kinds = ROOM_KINDS.filter((k) => looks.some((l) => l.room === k.id));
  const kindName = (id: string) => {
    const k = ROOM_KINDS.find((x) => x.id === id);
    return k ? (ar ? k.ar : k.en) : "";
  };
  const openLook = (id: string) => {
    setLookId(id);
    window.scrollTo({ top: 0 });
  };

  if (open) {
    // Previous / next within the same filter, so browsing a type of room stays in that type.
    const list = shown.some((l) => l.id === open.id) ? shown : looks;
    const at = list.findIndex((l) => l.id === open.id);
    const prev = list[(at - 1 + list.length) % list.length];
    const next = list[(at + 1) % list.length];
    return (
      <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-6 md:px-10 md:pt-10">
        <div className="mb-5 flex items-center justify-between gap-4 md:mb-8">
          <BackButton fallback="/inspiration" />
          <span className="text-[0.82rem] text-muted tabular-nums">
            {kindName(open.room)} · {at + 1} / {list.length}
          </span>
        </div>
        <LookCard key={open.id} look={open} />
        {list.length > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 text-[0.9rem]">
            <button onClick={() => openLook(prev.id)} className="group inline-flex min-w-0 items-center gap-2 text-ink/70 hover:text-ink">
              <ArrowLeft className="h-4 w-4 shrink-0 stroke-[1.5] rtl:rotate-180" />
              <span className="truncate">{tx(prev.title, lang)}</span>
            </button>
            <button onClick={() => openLook(next.id)} className="group inline-flex min-w-0 items-center gap-2 text-ink/70 hover:text-ink">
              <span className="truncate">{tx(next.title, lang)}</span>
              <ArrowRight className="h-4 w-4 shrink-0 stroke-[1.5] rtl:rotate-180" />
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={ar ? "إلهام" : "The lookbook"}
        title={ar ? ["غرف تستحق", "أن تُعاش"] : ["Rooms worth", "living in"]}
        sub={ar ? "غرف حقيقية من تنسيق فريقنا. اختر غرفة لترى قطعها وتتسوّقها." : "Real rooms styled by our team. Pick a room to see and shop its pieces."}
      >
        <div className="flex items-center gap-6 text-[0.88rem] text-ink-2">
          <span><span className="font-semibold text-ink tabular-nums">{looks.length}</span> {ar ? "غرف" : "rooms"}</span>
          <span className="h-4 w-px bg-ink/20" />
          <span><span className="font-semibold text-ink tabular-nums">{pieces}</span> {ar ? "قطعة" : "pieces"}</span>
        </div>
      </PageHero>

      {/* Room filter */}
      <div className="sticky top-[60px] z-20 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="no-scrollbar mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-3 md:px-10">
          {[{ id: "all", en: "All rooms", ar: "كل الغرف" }, ...kinds].map((k) => {
            const n = k.id === "all" ? looks.length : looks.filter((l) => l.room === k.id).length;
            return (
              <button key={k.id} onClick={() => setKind(k.id)} className={clsx("relative h-10 shrink-0 rounded-full px-4 text-[0.88rem] transition-colors", kind === k.id ? "text-white" : "text-ink/70 hover:text-ink")}>
                {kind === k.id && <motion.span layoutId="room-filter" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                {ar ? k.ar : k.en}
                <span className="ms-1.5 opacity-50 tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* All rooms of this type at a glance */}
      <section className="mx-auto max-w-[1440px] px-4 py-8 md:px-10 md:py-12">
        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((l, i) => (
            <motion.button
              key={`${kind}-${l.id}`}
              onClick={() => openLook(l.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
              className="group block text-start"
            >
              <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-plate">
                <Image src={l.image} alt={tx(l.title, lang)} fill sizes="(min-width:1024px) 31vw, (min-width:640px) 48vw, 100vw" className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04]" />
              </span>
              <span className="mt-3 flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate font-display text-[1.05rem] font-semibold tracking-tight">{tx(l.title, lang)}</span>
                <span className="shrink-0 text-[0.8rem] text-muted">
                  {l.pins.length} {ar ? "قطع" : l.pins.length === 1 ? "piece" : "pieces"}
                </span>
              </span>
              <span className="mt-2 inline-flex items-center gap-2 text-[0.86rem] font-medium text-ink">
                <span className="link-u">{ar ? "تسوّق الغرفة" : "Shop the room"}</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </span>
            </motion.button>
          ))}
        </div>
      </section>
    </>
  );
}

function LookCard({ look }: { look: ResolvedLook }) {
  const { t, lang, settings } = useSite();
  const materials = settings.materials;
  const ar = lang === "ar";
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const [active, setActive] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const activePin = look.pins.find((p) => p.product.id === active);
  const buyable = look.pins.filter((p) => !p.product.priceOnRequest);
  const total = buyable.reduce((s, p) => s + (p.product.salePrice || p.product.price), 0);

  const addRoom = () => {
    buyable.forEach(({ product: p }) =>
      add(quickLine(p, materials))
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setTimeout(() => setCart(true), 450);
  };

  return (
    <div>
      <motion.article
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative grid w-full origin-top overflow-hidden rounded-2xl bg-white md:rounded-none shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] ring-1 ring-ink/5 lg:grid-cols-12"
      >
        {/* Room */}
        <div className="relative lg:col-span-8">
          <div className="relative overflow-hidden bg-plate" style={{ aspectRatio: `${look.w}/${look.h}` }}>
            <motion.div
              className="absolute inset-0"
              animate={{ scale: activePin ? 1.06 : 1 }}
              style={{ transformOrigin: activePin ? `${activePin.x}% ${activePin.y}%` : "50% 50%" }}
              transition={{ duration: 1.2, ease: EASE }}
            >
              <Image src={look.image} alt={tx(look.title, lang)} fill sizes="(min-width:1024px) 62vw, 100vw" className="object-cover" />
            </motion.div>
            {look.pins.map((pin, k) => (
              <LookPin key={pin.product.id} pin={pin} lookId={`ins-${look.id}`} index={k} active={active} setActive={setActive} delay={0.4} />
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="flex flex-col p-5 md:p-8 lg:col-span-4 lg:p-10" style={{ background: TINT[look.id] ?? "#F3F2F0" }}>
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">{ROOM_KINDS.find((k) => k.id === look.room)?.[ar ? "ar" : "en"]}</p>
          <h1 className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.3rem)] font-semibold leading-[1.05] tracking-[-0.025em]">{tx(look.title, lang)}</h1>
          <p className="mt-2 font-serif text-[1.1rem] leading-relaxed text-ink-2">{tx(look.mood, lang)}</p>

          <ul className="mt-4 space-y-1 md:mt-6">
            {look.pins.map(({ product: p }) => (
              <li key={p.id} onPointerEnter={() => setActive(p.id)} onPointerLeave={() => setActive(null)}>
                <Link href={`/shop/${p.slug}`} className={clsx("group flex items-center gap-3 rounded-lg p-1.5 transition-colors", active === p.id ? "bg-white" : "hover:bg-white/70")}>
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white">
                    <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover transition duration-700 group-hover:scale-110" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.9rem]">{tx(p.name, lang)}</span>
                  <span className="text-[0.82rem] text-muted tabular-nums">{p.priceOnRequest ? t("shop.onRequest") : money(p.salePrice || p.price, lang)}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            <div className="mb-3 flex items-baseline justify-between border-t border-ink/10 pt-4">
              <span className="text-[0.85rem] text-muted">{ar ? "الغرفة كاملة" : "The full room"}</span>
              <span className="text-[1.2rem] font-semibold tabular-nums">{buyable.length ? money(total, lang) : t("shop.onRequest")}</span>
            </div>
            {buyable.length ? (
              <button onClick={addRoom} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.9rem] font-medium text-white transition hover:bg-ink-2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={String(added)} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                    {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4 stroke-[1.5]" />}
                    {added ? t("shop.added") : ar ? "أضف الغرفة للحقيبة" : "Add the room to bag"}
                  </motion.span>
                </AnimatePresence>
              </button>
            ) : (
              <Link href={`/quote?service=custom&product=${encodeURIComponent(tx(look.title, "en"))}`} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.9rem] font-medium text-white transition hover:bg-ink-2">
                {ar ? "اطلب عرض سعر لهذه الغرفة" : "Request a quote for this room"} <CircleArrow className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

      </motion.article>
    </div>
  );
}
