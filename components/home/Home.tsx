"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { CountUp, EASE, Reveal, SplitLines } from "@/components/ui/motion";
import { ArrowLink, CircleArrow, Eyebrow, OutlineLink, PillLink } from "@/components/ui/buttons";
import { ProductCard, materialTags } from "@/components/shop/ProductCard";
import { money, tx } from "@/lib/i18n";
import { useCart, useUI } from "@/lib/store";
import type { Category, Product, Project } from "@/lib/types";

/* ───────────────────────── Hero ───────────────────────── */
/** Words rise one by one from behind a mask. */
function WordsRise({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="split-line inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span className="word-rise" style={{ animationDelay: `${delay + i * 0.07}s` }}>
            {w}&nbsp;
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Keeps a point of an object-cover image pinned at the same spot on screen,
 * whatever the container's aspect ratio (used for "shop the look" hotspots).
 */
function useCoverPoint(ref: React.RefObject<HTMLElement | null>, img: { w: number; h: number; posX: number; posY: number }, pt: { x: number; y: number }) {
  const [pos, setPos] = useState<{ left: number; top: number; w: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = () => {
      const { width: cw, height: ch } = el.getBoundingClientRect();
      const s = Math.max(cw / img.w, ch / img.h);
      const rw = img.w * s;
      const rh = img.h * s;
      const ox = (cw - rw) * img.posX;
      const oy = (ch - rh) * img.posY;
      setPos({ left: ox + pt.x * rw, top: oy + pt.y * rh, w: cw });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, img.w, img.h, img.posX, img.posY, pt.x, pt.y]);
  return pos;
}

export function Hero({ image, look }: { image: string; look?: Product }) {
  const { t, lang } = useSite();
  const ref = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const spot = useCoverPoint(frame, { w: 2400, h: 1340, posX: 0.72, posY: 0.6 }, { x: 0.585, y: 0.6 });
  const [openSpot, setOpenSpot] = useState(false);

  // Introduce the hotspot once, a moment after the headline lands.
  useEffect(() => {
    const a = setTimeout(() => setOpenSpot(true), 2400);
    const b = setTimeout(() => setOpenSpot(false), 6200);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const usps = [
    lang === "ar" ? "صُنع في ورشتنا بدبي" : "Made in our Dubai workshop",
    lang === "ar" ? "توصيل وتركيب في الإمارات" : "Delivered & installed UAE-wide",
    lang === "ar" ? "ضمان 5 سنوات" : "5-year frame warranty",
  ];

  return (
    <section ref={ref} className="relative h-[calc(100svh-340px)] max-h-[680px] min-h-[470px] overflow-hidden md:h-[calc(100svh-150px)] md:max-h-none md:min-h-[600px]">
      {/* Mobile: one screen, the room fills the top and fades into the copy. Desktop: copy over the calm left side. */}
      <div ref={frame} className="absolute inset-x-0 bottom-[30%] top-0 overflow-hidden bg-plate md:bottom-0">
        <motion.div className="absolute inset-0" style={{ y }}>
          <div className="hero-zoom absolute inset-0">
            {/* slow, endless drift after the entrance zoom */}
            <motion.div className="absolute inset-0" animate={{ scale: [1, 1.05] }} transition={{ duration: 20, delay: 2.6, ease: "linear", repeat: Infinity, repeatType: "mirror" }}>
              <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-[72%_60%]" />
            </motion.div>
          </div>
          <div className="absolute inset-0 hidden bg-gradient-to-r from-white/80 via-white/30 to-transparent md:block rtl:bg-gradient-to-l" />
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-white via-white/70 to-transparent md:hidden" />

        {/* Shop-the-look hotspot */}
        {look && spot && (
          <div className="absolute z-10" style={{ left: spot.left, top: spot.top }} onPointerEnter={(e) => e.pointerType === "mouse" && setOpenSpot(true)} onPointerLeave={(e) => e.pointerType === "mouse" && setOpenSpot(false)}>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.8, type: "spring", stiffness: 260, damping: 18 }}
              onClick={() => setOpenSpot((v) => !v)}
              className="relative -translate-x-1/2 -translate-y-1/2"
              aria-label={tx(look.name, lang)}
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg">
                <motion.span animate={{ rotate: openSpot ? 45 : 0 }} className="flex"><Plus className="h-3.5 w-3.5" /></motion.span>
              </span>
            </motion.button>
            <AnimatePresence>
              {openSpot && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute bottom-5 w-60"
                  // keep the card fully on screen whatever side of the frame the hotspot is on
                  style={{ left: Math.min(Math.max(12 - spot.left, -120), spot.w - spot.left - 252) }}
                >
                  <Link href={`/shop/${look.slug}`} className="group flex items-center gap-3 bg-white p-2.5 pe-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)]">
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-plate">
                      <Image src={look.images[0]} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.85rem] font-medium">{tx(look.name, lang)}</span>
                      <span className="block text-[0.8rem] text-muted tabular-nums">{money(look.salePrice || look.price, lang)}</span>
                    </span>
                    <CircleArrow className="transition group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <motion.div style={{ opacity: fade }} className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] flex-col px-5 pb-6 text-ink md:relative md:inset-auto md:h-full md:justify-center md:px-10 md:py-0">
        <p className="fade-up mb-3 flex md:mb-4 items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink/60" style={{ animationDelay: "0.15s" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {lang === "ar" ? "تنفيذ · منذ 2021" : "TANFEEZ · Est. 2021"}
        </p>
        <p className="font-serif text-[1.35rem] leading-tight text-ink-2 md:text-[2.3rem]">
          <WordsRise text={t("v2.heroSerif")} delay={0.3} />
        </p>
        <h1 className="mt-1 max-w-[48rem] font-display text-[clamp(2.15rem,4.7vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
          <WordsRise text={t("v2.heroTitle")} delay={0.55} />
        </h1>
        <div className="fade-up mt-6 grid grid-cols-[1fr_auto] gap-2 md:mt-9 md:flex md:flex-wrap md:gap-3" style={{ animationDelay: "1.05s" }}>
          <PillLink href="/shop" className="whitespace-nowrap px-4 md:px-7">{t("v2.heroShop")}</PillLink>
          <OutlineLink href="/quote" className="gap-2 whitespace-nowrap bg-white/60 px-4 backdrop-blur md:gap-3 md:px-6">{t("v2.heroProject")}</OutlineLink>
        </div>
      </motion.div>

      {/* Trust strip */}
      <ul
        style={{ animationDelay: "1.4s" }}
        className="fade-up absolute inset-x-0 bottom-0 z-10 mx-auto hidden max-w-[1440px] items-center gap-8 px-10 pb-7 text-[0.8rem] text-ink/70 md:flex"
      >
        {usps.map((u) => (
          <li key={u} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5" /> {u}
          </li>
        ))}
        <li className="ms-auto flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.2em]">
          {t("hero.scroll")}
          <span className="relative block h-px w-14 overflow-hidden bg-ink/15">
            <motion.span className="absolute inset-y-0 start-0 w-1/2 bg-ink" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
          </span>
        </li>
      </ul>
    </section>
  );
}

/* ───────────── Horizontal rail with arrows + progress line ───────────── */
function Rail({ children, className, itemClass }: { children: React.ReactNode[]; className?: string; itemClass: string }) {
  const { dir } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ratio, setRatio] = useState(0.3);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.abs(el.scrollLeft);
    setProgress(max > 0 ? x / max : 0);
    setRatio(Math.min(1, el.clientWidth / el.scrollWidth));
    setEdge({ start: x < 4, end: x > max - 4 });
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const go = (d: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: d * el.clientWidth * 0.8 * (dir === "rtl" ? -1 : 1), behavior: "smooth" });
  };

  return (
    <div className={clsx("relative", className)}>
      <div ref={ref} onScroll={update} className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-5 px-5 md:scroll-px-10 md:px-10">
        {children.map((c, i) => (
          <div key={i} className={clsx("shrink-0 snap-start", itemClass)}>
            {c}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-5 flex max-w-[1440px] items-center gap-6 px-5 md:mt-8 md:px-10">
        <div className="relative h-px flex-1 bg-line">
          <motion.div
            className="absolute inset-y-0 start-0 bg-ink"
            animate={{ width: `${ratio * 100}%`, x: `${(dir === "rtl" ? -1 : 1) * ((progress * (1 - ratio)) / ratio) * 100}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 40 }}
          />
        </div>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => go(-1)} disabled={edge.start} className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:border-ink disabled:opacity-30" aria-label="Previous">
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          <button onClick={() => go(1)} disabled={edge.end} className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:border-ink disabled:opacity-30" aria-label="Next">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Categories ───────────────────────── */
function CategoryTile({ c, cover, count, big = false, priority = false }: { c: Category; cover: string; count: number; big?: boolean; priority?: boolean }) {
  const { lang } = useSite();
  return (
    <Link href={`/shop?c=${c.slug}`} className="group relative block h-full overflow-hidden bg-plate">
      <div className="absolute inset-0 transition-transform duration-[1800ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]">
        <Image src={cover} alt={tx(c.name, lang)} fill priority={priority} sizes={big ? "(min-width:1024px) 50vw, 90vw" : "(min-width:1024px) 25vw, 70vw"} className="object-cover" />
      </div>
      <div className="absolute bottom-3 start-3 flex items-center gap-3 bg-white py-3 pe-3 ps-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:pe-4 md:bottom-4 md:start-4">
        <div>
          <p className={clsx("font-display font-semibold leading-tight tracking-[-0.02em]", big ? "text-[clamp(1.3rem,2vw,1.8rem)]" : "text-[1.05rem]")}>{tx(c.name, lang)}</p>
          <p className="mt-0.5 text-[0.76rem] text-muted">
            {count} {lang === "ar" ? "قطعة" : count === 1 ? "piece" : "pieces"}
          </p>
        </div>
        <span className="flex h-8 w-0 items-center justify-center overflow-hidden rounded-full bg-ink text-white opacity-0 transition-all duration-500 group-hover:w-8 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 shrink-0 rtl:-scale-x-100" />
        </span>
      </div>
    </Link>
  );
}

/** Mobile: one-tap shortcuts into the shop, story-style, right under the hero. */
export function QuickShop({ categories, covers }: { categories: Category[]; covers: Record<string, string> }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const items = [
    { href: "/shop", label: ar ? "الكل" : "Shop all", img: "/images/lifestyle/hero.jpg" },
    ...categories.map((c) => ({ href: `/shop?c=${c.slug}`, label: SHORT[c.slug]?.[ar ? 1 : 0] ?? tx(c.name, lang), img: covers[c.slug] ?? c.image })),
    { href: "/inspiration", label: ar ? "إلهام" : "Rooms", img: "/images/lifestyle/look-emerald.jpg" },
  ];
  return (
    <section className="border-b border-line pb-5 pt-2 md:hidden">
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-5">
        {items.map((it, i) => (
          <Link key={it.href} href={it.href} className="fade-up group flex w-[68px] shrink-0 flex-col items-center gap-2" style={{ animationDelay: `${1.1 + i * 0.05}s` }}>
            <span className={clsx("relative block h-[64px] w-[64px] overflow-hidden rounded-full bg-plate ring-1 ring-offset-2", i === 0 ? "ring-brand" : "ring-line")}>
              <Image src={it.img} alt="" fill sizes="64px" className="object-cover transition duration-500 group-active:scale-95" />
            </span>
            <span className="w-full truncate text-center text-[0.74rem] leading-tight text-ink/80">{it.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
const SHORT: Record<string, [string, string]> = {
  sofas: ["Sofas", "الكنب"],
  armchairs: ["Armchairs", "الكراسي"],
  beds: ["Beds", "الأسرّة"],
  media: ["Media walls", "التلفاز"],
  storage: ["Wardrobes", "الخزائن"],
  tables: ["Tables", "الطاولات"],
  joinery: ["Joinery", "النجارة"],
  commercial: ["Retail", "التجاري"],
};

export function Categories({ categories, covers, counts }: { categories: Category[]; covers: Record<string, string>; counts: Record<string, number> }) {
  const { t, lang } = useSite();
  const five = categories.slice(0, 5);
  return (
    <section className="hidden py-16 md:block md:py-24">
      <div className="mx-auto mb-8 flex max-w-[1440px] items-end justify-between gap-6 px-5 md:mb-10 md:px-10">
        <div>
          <Reveal><p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{lang === "ar" ? "تسوّق حسب الغرفة" : "Shop by room"}</p></Reveal>
          <h2 className="mt-1 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
            <SplitLines lines={[t("v2.lookingFor")]} />
          </h2>
        </div>
        <Reveal delay={0.1} className="hidden md:block"><ArrowLink href="/shop">{t("home.shopAll")}</ArrowLink></Reveal>
      </div>

      {/* Desktop bento */}
      <div className="mx-auto hidden max-w-[1440px] grid-cols-4 grid-rows-2 gap-2 px-10 lg:grid" style={{ height: "min(78vh, 760px)" }}>
        {five.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.08} className={i === 0 ? "col-span-2 row-span-2" : ""} y={40}>
            <CategoryTile c={c} cover={covers[c.slug] ?? c.image} count={counts[c.slug] ?? 0} big={i === 0} />
          </Reveal>
        ))}
      </div>

      {/* Mobile / tablet rail */}
      <div className="lg:hidden">
        <Rail itemClass="w-[72vw] sm:w-[320px]">
          {categories.map((c) => (
            <div key={c.id} className="aspect-[4/5]">
              <CategoryTile c={c} cover={covers[c.slug] ?? c.image} count={counts[c.slug] ?? 0} />
            </div>
          ))}
        </Rail>
      </div>
    </section>
  );
}

/* ───────────── The Edit: one product at a time, cinematic ───────────── */
export function Spotlight({ products }: { products: Product[] }) {
  const { t, lang } = useSite();
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const DURATION = 6500;
  const p = products[i];

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(1), DURATION);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused]);

  const go = (d: 1 | -1) => {
    setDir(d);
    setI((x) => (x + d + products.length) % products.length);
  };

  if (!p) return null;
  const price = p.salePrice || p.price;

  return (
    <section className="bg-band py-12 md:py-24" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-12">
          <div className="min-w-0">
            <Reveal><p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{lang === "ar" ? "مختاراتنا" : "The edit"}</p></Reveal>
            <h2 className="mt-1 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
              <SplitLines lines={[lang === "ar" ? "قطع تستحق مكانها" : "Pieces worth the space"]} />
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden whitespace-nowrap font-serif text-[1.3rem] tabular-nums text-ink/50 sm:inline" dir="ltr">
              {String(i + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white/50 transition hover:border-ink hover:bg-white" aria-label="Previous">
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <button onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white/50 transition hover:border-ink hover:bg-white" aria-label="Next">
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-5 lg:grid-cols-12 lg:gap-14">
          {/* Image stage: new piece wipes in over the old */}
          <div className="relative aspect-square overflow-hidden bg-plate lg:col-span-7 lg:aspect-[5/4]">
            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={p.id}
                custom={dir}
                className="absolute inset-0"
                variants={{
                  enter: (d: number) => ({ clipPath: d > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }),
                  center: { clipPath: "inset(0 0 0 0%)" },
                  exit: { opacity: 1 },
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 1.1, ease: EASE }}
              >
                <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: EASE }}>
                  <Image src={p.images[0]} alt={tx(p.name, lang)} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            <Link href={`/shop/${p.slug}`} className="absolute inset-0 z-10" aria-label={tx(p.name, lang)} />
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div key={p.id} initial="hidden" animate="show" exit="out" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
                {[
                  <p key="eb" className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">{materialTags(p, lang)}</p>,
                  <h3 key="h" className="mt-2 font-display md:mt-3 text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.03em]">{tx(p.name, lang)}</h3>,
                  <p key="d" className="mt-5 hidden max-w-md font-serif md:block text-[1.2rem] leading-relaxed text-ink-2">{tx(p.description, lang)}</p>,
                  <div key="sw" className="mt-3 flex items-center gap-2 md:mt-6">
                    {p.finishes.map((f, k) => (
                      <span key={k} title={tx(f.name, lang)} className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: f.hex }} />
                    ))}
                    <span className="ms-2 text-[0.82rem] text-muted">{p.finishes.length} {lang === "ar" ? "خيارات" : p.finishes.length === 1 ? "finish" : "finishes"}</span>
                  </div>,
                  <dl key="spec" className="mt-7 hidden max-w-md grid-cols-2 md:grid gap-4 border-y border-ink/10 py-5 text-[0.85rem]">
                    <div><dt className="text-muted">{t("shop.dimensions")}</dt><dd className="mt-0.5">{p.dimensions}</dd></div>
                    <div><dt className="text-muted">{lang === "ar" ? "مدة التجهيز" : "Lead time"}</dt><dd className="mt-0.5">{p.priceOnRequest ? t("shop.madeToOrder") : t("shop.leadTime", { n: p.leadTimeDays })}</dd></div>
                  </dl>,
                  <div key="cta" className="mt-5 flex flex-wrap items-center gap-3 md:mt-7">
                    {p.priceOnRequest ? (
                      <PillLink href={`/quote?service=custom&product=${encodeURIComponent(p.name.en)}`}>{t("shop.request")}</PillLink>
                    ) : (
                      <button
                        onClick={() => {
                          add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], price, finish: p.finishes[0] ? tx(p.finishes[0].name, "en") : undefined, size: p.sizes[0] });
                          setCart(true);
                        }}
                        className="inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-7 text-[0.92rem] font-medium text-white transition hover:bg-ink-2"
                      >
                        <Plus className="h-4 w-4" /> {lang === "ar" ? "أضف للحقيبة" : "Add to bag"} · <span className="tabular-nums">{money(price, lang)}</span>
                      </button>
                    )}
                    <OutlineLink href={`/shop/${p.slug}`}>{lang === "ar" ? "التفاصيل" : "View details"}</OutlineLink>
                  </div>,
                ].map((el, k) => (
                  <motion.div
                    key={k}
                    variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }, out: { opacity: 0, y: -8, transition: { duration: 0.25 } } }}
                  >
                    {el}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress per slide */}
        <div className="mt-6 grid gap-2 md:mt-10" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
          {products.map((q, k) => (
            <button key={q.id} onClick={() => { setDir(k > i ? 1 : -1); setI(k); }} className="group py-2 text-start" aria-label={tx(q.name, lang)}>
              <span className="relative block h-px overflow-hidden bg-ink/15">
                {k < i && <span className="absolute inset-0 bg-ink" />}
                {k === i && (
                  <motion.span
                    key={`${i}-${paused}`}
                    className="absolute inset-y-0 start-0 bg-ink"
                    initial={{ width: paused ? "100%" : "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: paused ? 0 : DURATION / 1000, ease: "linear" }}
                  />
                )}
              </span>
              <span className={clsx("mt-2 hidden truncate text-[0.78rem] transition-colors md:block", k === i ? "text-ink" : "text-ink/40 group-hover:text-ink/70")}>{tx(q.name, lang)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Collections with tabs ───────────── */
export function Collections({ groups }: { groups: { id: string; label: string; products: Product[] }[] }) {
  const { t, lang } = useSite();
  const [tab, setTab] = useState(groups[0]?.id);
  const current = groups.find((g) => g.id === tab) ?? groups[0];
  return (
    <section className="py-12 md:py-24">
      <div className="mx-auto mb-6 flex max-w-[1440px] flex-col justify-between gap-4 px-5 md:mb-12 md:flex-row md:items-end md:gap-6 md:px-10">
        <div>
          <Reveal><p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{t("v2.newIn")}</p></Reveal>
          <h2 className="mt-1 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
            <SplitLines lines={[t("v2.newInTitle")]} />
          </h2>
        </div>
        <Reveal delay={0.1}>
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist">
            {groups.map((g) => (
              <button key={g.id} role="tab" aria-selected={tab === g.id} onClick={() => setTab(g.id)} className={clsx("relative h-10 shrink-0 rounded-full px-5 text-[0.88rem] transition-colors", tab === g.id ? "text-white" : "text-ink/60 hover:text-ink")}>
                {tab === g.id && <motion.span layoutId="collection-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                <span className="relative">{g.label}</span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Desktop grid */}
      <div className="mx-auto hidden max-w-[1440px] px-10 lg:block">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} className="grid grid-cols-4 gap-x-3 gap-y-12" initial="hidden" animate="show" exit="out" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
            {current.products.slice(0, 8).map((p, k) => (
              <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } }, out: { opacity: 0, transition: { duration: 0.2 } } }}>
                <ProductCard product={p} priority={k < 4} sizes="25vw" />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        <div className="mt-14 flex justify-center">
          <OutlineLink href="/shop">{lang === "ar" ? "تسوّق كل الأثاث" : "Shop all furniture"}</OutlineLink>
        </div>
      </div>

      {/* Mobile rail */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Rail itemClass="w-[60vw] sm:w-[320px]">
              {current.products.map((p, k) => (
                <ProductCard key={p.id} product={p} priority={k < 2} sizes="72vw" />
              ))}
            </Rail>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ───────────── Tailored: the 3D fan-out animation ───────────── */
export function Tailored({ products }: { products: Product[] }) {
  const { t, lang } = useSite();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start 0.95", "center 0.55"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  // Three plates start stacked in depth, then fan out flat as the section scrolls in.
  const sideX = useTransform(p, [0, 1], ["0%", "104%"]);
  const sideXNeg = useTransform(p, [0, 1], ["0%", "-104%"]);
  const sideRot = useTransform(p, [0, 1], [38, 0]);
  const sideRotNeg = useTransform(p, [0, 1], [-38, 0]);
  const sideZ = useTransform(p, [0, 1], [-260, 0]);
  const centerZ = useTransform(p, [0, 1], [120, 0]);
  const centerRotX = useTransform(p, [0, 1], [14, 0]);
  const shadow = useTransform(p, [0, 1], [0.35, 0.08]);
  const shadowCss = useTransform(shadow, (s) => `0 40px 80px -30px rgba(0,0,0,${s})`);

  const trio = products.slice(0, 3);
  const flip = lang === "ar" ? -1 : 1;

  return (
    <section className="hidden overflow-hidden py-12 md:block md:py-28">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <Reveal><p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{t("v2.tailoredSerif")}</p></Reveal>
        <h2 className="mt-1 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
          <SplitLines lines={[t("v2.tailoredTitle")]} />
        </h2>
        <Reveal delay={0.1}><p className="mt-4 max-w-3xl font-serif text-[1.2rem] leading-relaxed text-ink-2">{t("v2.tailoredD")}</p></Reveal>
        <Reveal delay={0.2} className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
          <ArrowLink href="/shop">{t("v2.fabrics")}</ArrowLink>
          <ArrowLink href="/quote?service=custom">{t("v2.helpCustom")}</ArrowLink>
        </Reveal>
      </div>

      <div ref={stage} className="mx-auto mt-14 max-w-[1100px] px-5 md:mt-20 md:px-10" style={{ perspective: 1600 }}>
        <div className="relative mx-auto w-[30%] min-w-[150px] [transform-style:preserve-3d]">
          {trio.map((prod, i) => {
            const isCenter = i === 1;
            const style = isCenter
              ? { z: centerZ, rotateX: centerRotX, boxShadow: shadowCss }
              : i === 0
                ? { x: flip > 0 ? sideXNeg : sideX, rotateY: flip > 0 ? sideRot : sideRotNeg, z: sideZ, boxShadow: shadowCss }
                : { x: flip > 0 ? sideX : sideXNeg, rotateY: flip > 0 ? sideRotNeg : sideRot, z: sideZ, boxShadow: shadowCss };
            return (
              <motion.div key={prod.id} style={style} className={clsx("aspect-square bg-plate", isCenter ? "relative z-10" : "absolute inset-0")}>
                <Link href={`/shop/${prod.slug}`} className="group relative block h-full w-full overflow-hidden">
                  <Image src={prod.images[0]} alt={tx(prod.name, lang)} fill sizes="34vw" className="object-cover transition duration-1000 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 translate-y-full bg-white/90 px-3 py-2 text-[0.8rem] backdrop-blur transition duration-500 group-hover:translate-y-0">{tx(prod.name, lang)}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Projects: hover list that swaps the image ───────────── */
export function ProjectsShowcase({ projects }: { projects: Project[] }) {
  const { t, lang } = useSite();
  const [active, setActive] = useState(0);
  const list = projects.slice(0, 6);
  const cur = list[active];
  // gentle 3D tilt on the image following the pointer
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 20 });
  const sry = useSpring(ry, { stiffness: 120, damping: 20 });

  return (
    <section className="bg-band py-12 md:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal><p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{t("v2.projectsSerif")}</p></Reveal>
            <h2 className="mt-1 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
              <SplitLines lines={[t("v2.projectsTitle")]} />
            </h2>
            <Reveal delay={0.1}><p className="mt-4 font-serif text-[1.15rem] leading-relaxed text-ink-2">{t("v2.projectsD")}</p></Reveal>

            <ul className="mt-10 hidden border-t border-ink/10 lg:block">
              {list.map((p, i) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex items-baseline justify-between gap-4 border-b border-ink/10 py-4"
                  >
                    <span className={clsx("font-display text-[1.35rem] font-semibold tracking-tight transition-colors duration-300", active === i ? "text-ink" : "text-ink/35")}>
                      {p.client}
                    </span>
                    <span className={clsx("text-[0.82rem] transition-colors", active === i ? "text-ink/70" : "text-ink/30")}>{tx(p.location, lang)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Reveal delay={0.2} className="mt-8 hidden lg:block"><ArrowLink href="/projects">{t("home.allProjects")}</ArrowLink></Reveal>
          </div>

          <div className="hidden lg:col-span-7 lg:block" style={{ perspective: 1400 }}>
            <motion.div
              style={{ rotateX: srx, rotateY: sry }}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
                rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
              }}
              onPointerLeave={() => {
                rx.set(0);
                ry.set(0);
              }}
              className="relative aspect-[4/3.2] overflow-hidden bg-plate"
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={cur.id}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.08 }}
                  animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                  exit={{ opacity: 0.999 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <Image src={cur.images[0]?.src} alt={cur.client} fill sizes="55vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-0 start-0 z-10 bg-white px-5 py-3 text-[0.85rem]">
                {tx(cur.title, lang)} · <span className="text-muted">{tx(cur.scope, lang)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: swipeable cards */}
      <div className="mt-10 lg:hidden">
        <Rail itemClass="w-[80vw] sm:w-[420px]">
          {list.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className="block">
              <div className="relative aspect-[4/3] overflow-hidden bg-plate">
                <Image src={p.images[0]?.src} alt={p.client} fill sizes="80vw" className="object-cover" />
              </div>
              <p className="mt-3 font-display text-[1.15rem] font-semibold">{p.client}</p>
              <p className="text-[0.82rem] text-muted">{tx(p.location, lang)}</p>
            </Link>
          ))}
        </Rail>
      </div>
    </section>
  );
}

/* ───────────────────────── Clients ───────────────────────── */
const CLIENTS = ["Galeries Lafayette", "Harvey Nichols", "VOX Cinemas", "Corneliani", "Pal Zileri", "Peserico", "Drykorn", "Pellini", "L'Étrange", "Vilhelm Parfumerie", "The Art of Shaving", "Sharjah Airport"];
export function Clients() {
  const { t } = useSite();
  return (
    <section className="border-y border-line py-10 md:py-16">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Eyebrow className="mb-6 justify-center md:mb-8">{t("v2.clients")}</Eyebrow>
      </div>
      {/* Phones: two rows of names drifting in opposite directions */}
      <div className="marquee-mask space-y-3 md:hidden" dir="ltr">
        {[CLIENTS.slice(0, 6), CLIENTS.slice(6)].map((row, r) => (
          <div key={r} className="flex w-max">
            <div className={clsx("flex shrink-0 gap-8 pe-8", r ? "marquee-rev" : "marquee")}>
              {[...row, ...row].map((c, i) => (
                <span key={i} className="whitespace-nowrap font-serif text-[1.15rem] text-ink/55">{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto hidden max-w-[1440px] px-5 md:block md:px-10">
        <ul className="grid grid-cols-3 gap-x-4 gap-y-4 text-center lg:grid-cols-6" dir="ltr">
          {CLIENTS.map((c, i) => (
            <Reveal as="li" key={c} delay={(i % 6) * 0.04} className="font-serif text-[1rem] leading-tight text-ink/55 transition-colors hover:text-ink md:text-[1.4rem]">
              {c}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────── Help CTA ───────────────────────── */
export function HelpCTA() {
  const { t } = useSite();
  return (
    <section className="py-12 md:py-28">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 md:px-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative hidden aspect-[4/3] overflow-hidden bg-plate md:block lg:order-2">
          <ParallaxImg src="/images/craft/craftsman.jpg" />
        </Reveal>
        <div className="max-w-xl rounded-2xl bg-band p-6 md:rounded-none md:bg-transparent md:p-0">
          <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
            <SplitLines lines={[t("v2.helpTitle")]} />
          </h2>
          <Reveal delay={0.1}><p className="mt-4 font-serif text-[1.2rem] leading-relaxed text-ink-2">{t("v2.helpD")}</p></Reveal>
          <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/quote">{t("v2.helpCta")}</PillLink>
            <OutlineLink href="/contact">{t("nav.contact")}</OutlineLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ParallaxImg({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-[-10%_0]">
        <Image src={src} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
      </motion.div>
    </div>
  );
}

/* ───────────────────────── Heritage + stats ───────────────────────── */
export function Heritage({ projectCount }: { projectCount: number }) {
  const { t, lang } = useSite();
  const stats = [
    { v: projectCount, s: "+", l: lang === "ar" ? "مشروع لعلامات رائدة" : "Flagship projects" },
    { v: 7, s: "", l: lang === "ar" ? "إمارات نخدمها" : "Emirates served" },
    { v: 100, s: "%", l: lang === "ar" ? "إنتاج داخلي" : "Made in-house" },
    { v: 5, s: lang === "ar" ? " سنوات" : " yr", l: lang === "ar" ? "ضمان على الهيكل" : "Frame warranty" },
  ];
  return (
    <section className="pb-12 md:pb-28">
      <div className="relative h-[34vh] min-h-[230px] overflow-hidden bg-plate md:h-[72vh]">
        <ParallaxImg src="/images/craft/gloves-wide.jpg" />
      </div>
      <div className="mx-auto mt-12 grid max-w-[1100px] gap-12 px-5 md:mt-16 md:px-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
            <SplitLines lines={[t("v2.heritageTitle")]} />
          </h2>
          <Reveal delay={0.1}><p className="mt-4 font-serif text-[1.2rem] leading-relaxed text-ink-2">{t("v2.heritageD")}</p></Reveal>
          <Reveal delay={0.2} className="mt-6"><ArrowLink href="/about">{t("v2.ourStory")}</ArrowLink></Reveal>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 self-end">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.06} className="border-t border-ink pt-3">
              <dd className="font-display text-[2.4rem] font-semibold leading-none tracking-[-0.03em]">
                <CountUp to={s.v} suffix={s.s} />
              </dd>
              <dt className="mt-2 text-[0.82rem] text-muted">{s.l}</dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */
const FAQ = {
  en: [
    ["How long does a made-to-order piece take?", "Most sofas, beds and tables are ready in 7–21 days. Larger joinery such as wardrobes, media walls and staircases takes 3–5 weeks after the site measurement."],
    ["Can I change the size, fabric or finish?", "Yes. Every piece is built in our Dubai workshop, so dimensions, fabrics, leathers, wood species and lacquer colours can be tailored. Use “Request a quote” on any product."],
    ["Do you deliver and install across the UAE?", "Our own team delivers and installs in all seven emirates. Delivery is free in Dubai on orders over AED 5,000."],
    ["How can I pay?", "Split any order into 4 interest-free payments with Tabby or 3 with Tamara, or pay by card or cash on delivery, or by bank transfer. Online card payment and Apple Pay are coming soon."],
    ["Do you take on commercial fit-out projects?", "Fit-out is where we started. We deliver turnkey retail, F&B, office and hospitality interiors, including shop drawings and mall approvals."],
  ],
  ar: [
    ["كم تستغرق القطعة المصنوعة حسب الطلب؟", "معظم الكنب والأسرّة والطاولات جاهزة خلال 7–21 يوماً. أما النجارة الكبيرة مثل الخزائن وجدران التلفاز والسلالم فتستغرق 3–5 أسابيع بعد أخذ القياسات."],
    ["هل يمكنني تغيير المقاس أو القماش أو اللون؟", "نعم. كل قطعة تُصنع في ورشتنا بدبي، لذا يمكن تخصيص الأبعاد والأقمشة والجلود وأنواع الخشب وألوان اللاكر. استخدم «اطلب عرض سعر» في أي منتج."],
    ["هل توصلون وتركّبون في جميع الإمارات؟", "يقوم فريقنا الخاص بالتوصيل والتركيب في الإمارات السبع. التوصيل مجاني في دبي للطلبات فوق 5,000 درهم."],
    ["ما طرق الدفع المتاحة؟", "قسّم أي طلب على 4 دفعات بدون فوائد مع تابي أو 3 دفعات مع تمارا، أو ادفع بالبطاقة أو نقداً عند التسليم أو بالتحويل البنكي. الدفع الإلكتروني وApple Pay قريباً."],
    ["هل تنفذون مشاريع تجهيز تجارية؟", "التجهيز الداخلي هو بدايتنا. ننفذ مشاريع متكاملة للمحلات والمطاعم والمكاتب والضيافة، بما في ذلك الرسومات التنفيذية وموافقات المولات."],
  ],
};

export function Faq() {
  const { t, lang } = useSite();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-t border-line py-12 md:py-24">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-5 md:px-10 lg:grid-cols-[1fr_2fr]">
        <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">{t("v2.faqTitle")}</h2>
        <ul className="border-t border-line">
          {FAQ[lang].map(([q, a], i) => (
            <li key={i} className="border-b border-line">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-5 text-start text-[1.02rem] font-medium" aria-expanded={open === i}>
                {q}
                <Plus className={clsx("h-5 w-5 shrink-0 stroke-[1.5] transition-transform duration-500", open === i && "rotate-45")} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                    <p className="max-w-2xl pb-6 font-serif text-[1.1rem] leading-relaxed text-ink-2">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
