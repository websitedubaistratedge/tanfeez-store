"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { useCart, useUI } from "@/lib/store";
import { money, tx } from "@/lib/i18n";
import { EASE, Reveal, SplitLines } from "@/components/ui/motion";
import { PageHero } from "@/components/site/PageHero";
import { ArrowLink, CircleArrow, PillLink } from "@/components/ui/buttons";
import { LookPin, type ResolvedLook } from "@/components/home/ShopTheLook";
import { ROOM_KINDS } from "@/lib/looks";

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
  const stack = useRef<HTMLDivElement>(null);
  const filters = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<string>("all");
  const shown = kind === "all" ? looks : looks.filter((l) => l.room === kind);
  const { scrollYProgress } = useScroll({ target: stack, offset: ["start start", "end end"] });
  const pieces = new Set(looks.flatMap((l) => l.pins.map((p) => p.product.id))).size;
  const kinds = ROOM_KINDS.filter((k) => looks.some((l) => l.room === k.id));
  const pick = (k: string) => {
    setKind(k);
    const top = (filters.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 70;
    if (window.scrollY > top) window.scrollTo({ top });
  };

  return (
    <>
      <PageHero
        eyebrow={ar ? "إلهام" : "The lookbook"}
        title={ar ? ["غرف تستحق", "أن تُعاش"] : ["Rooms worth", "living in"]}
        sub={ar ? "غرف حقيقية نسّقها فريقنا بقطع من صنعنا. اضغط على أي قطعة لتراها، أو أضف الغرفة كاملة إلى حقيبتك." : "Real rooms, styled by our team with pieces from our own workshop. Tap any piece to see it, or bring the whole room home."}
      >
        <div className="flex items-center gap-6 text-[0.88rem] text-ink-2">
          <span><span className="font-semibold text-ink tabular-nums">{looks.length}</span> {ar ? "غرف" : "rooms"}</span>
          <span className="h-4 w-px bg-ink/20" />
          <span><span className="font-semibold text-ink tabular-nums">{pieces}</span> {ar ? "قطعة" : "pieces"}</span>
          <span className="h-4 w-px bg-ink/20" />
          <span>{ar ? "صُنعت في دبي" : "Made in Dubai"}</span>
        </div>
      </PageHero>

      {/* Room filter */}
      <div ref={filters} className="sticky top-[60px] z-20 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="no-scrollbar mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-3 md:px-10">
          {[{ id: "all", en: "All rooms", ar: "كل الغرف" }, ...kinds].map((k) => {
            const n = k.id === "all" ? looks.length : looks.filter((l) => l.room === k.id).length;
            return (
              <button key={k.id} onClick={() => pick(k.id)} className={clsx("relative h-10 shrink-0 rounded-full px-4 text-[0.88rem] transition-colors", kind === k.id ? "text-white" : "text-ink/70 hover:text-ink")}>
                {kind === k.id && <motion.span layoutId="room-filter" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                {ar ? k.ar : k.en}
                <span className="ms-1.5 opacity-50 tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={stack} key={kind} className="relative mx-auto max-w-[1440px] px-4 md:px-10">
        {shown.map((look, i) => (
          <LookCard key={look.id} look={look} i={i} n={shown.length} progress={scrollYProgress} />
        ))}
      </div>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-2 lg:items-end">
          <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            <SplitLines lines={ar ? ["تريد هذه الغرفة", "في منزلك؟"] : ["Want this room", "in your home?"]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="max-w-md font-serif text-[1.2rem] leading-relaxed text-ink-2">
              {ar ? "يزورك مصممونا، يقيسون المساحة ويعيدون تنسيق أي إطلالة بأقمشتك ومقاساتك." : "Our designers visit, measure, and restyle any look around your floor plan, in your fabrics and sizes."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PillLink href="/quote?service=furniture">{ar ? "احجز استشارة تصميم" : "Book a design consultation"}</PillLink>
              <ArrowLink href="/shop">{ar ? "تسوّق كل القطع" : "Shop every piece"}</ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function LookCard({ look, i, n, progress }: { look: ResolvedLook; i: number; n: number; progress: MotionValue<number> }) {
  const { t, lang } = useSite();
  const ar = lang === "ar";
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const [active, setActive] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // As later rooms slide over, earlier ones settle back like pages in a stack.
  // Each card settles back over the next few cards' scroll, however long the stack is.
  const last = i === n - 1;
  const scale = useTransform(progress, [i / n, Math.min(1, (i + 3) / n)], [1, last ? 1 : 0.9]);
  // The stacking effect needs room; phones get a plain list of cards instead.
  const stack = useWide();
  const shade = useTransform(progress, [i / n, Math.min(1, (i + 1) / n)], [0, i === n - 1 ? 0 : 0.18]);

  const activePin = look.pins.find((p) => p.product.id === active);
  const buyable = look.pins.filter((p) => !p.product.priceOnRequest);
  const total = buyable.reduce((s, p) => s + (p.product.salePrice || p.product.price), 0);
  const flip = i % 2 === 1;

  const addRoom = () => {
    buyable.forEach(({ product: p }) =>
      add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], price: p.salePrice || p.price, finish: p.finishes[0] ? tx(p.finishes[0].name, "en") : undefined, size: p.sizes[0] })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setTimeout(() => setCart(true), 450);
  };

  return (
    <div className="py-2.5 md:sticky md:flex md:min-h-svh md:items-center md:py-28" style={stack ? { top: Math.min(i, 3) * 14 } : undefined}>
      <motion.article
        style={stack ? { scale } : undefined}
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1, ease: EASE }}
        className="relative grid w-full origin-top overflow-hidden rounded-2xl bg-white md:rounded-none shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] ring-1 ring-ink/5 lg:grid-cols-12"
      >
        {/* Room */}
        <div className={clsx("relative lg:col-span-8", flip && "lg:order-2")}>
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
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-[2rem] leading-none text-ink/80 md:text-[3.4rem]" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted" dir="ltr">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          </div>
          <h2 className="mt-3 font-display text-[clamp(1.5rem,2.4vw,2.3rem)] md:mt-4 font-semibold leading-[1.05] tracking-[-0.025em]">{tx(look.title, lang)}</h2>
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

        {stack && <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-ink" />}
      </motion.article>
    </div>
  );
}

/** True from the md breakpoint up (where the stacked-cards effect has room). */
function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}
