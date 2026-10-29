"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Check, Clock, Heart, Minus, Plus, Ruler, ShieldCheck, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { useCart, useHydrated, useUI, useWishlist } from "@/lib/store";
import { money, tx } from "@/lib/i18n";
import type { Category, Product } from "@/lib/types";
import { EASE, Reveal } from "@/components/ui/motion";
import { ArrowLink } from "@/components/ui/buttons";
import { ProductCard } from "./ProductCard";
import { AnimatedPrice, Configurator, Installments, fabricStyle, type Config } from "./Configurator";
import { configPrice, defaultConfig, describeConfig, materialsFor } from "@/lib/configurator";

export function ProductView({ product: p, related, category, rooms = [] }: { product: Product; related: Product[]; category?: Category; rooms?: { image: string; title: string; x: number; y: number }[] }) {
  const { t, lang } = useSite();
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const wish = useWishlist();
  const hydrated = useHydrated();
  const [img, setImg] = useState(0);
  const [cfg, setCfg] = useState<Config>(() => defaultConfig(p));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState<string | null>("details");
  const buyRef = useRef<HTMLDivElement>(null);
  const buyVisible = useInView(buyRef);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 500));

  const price = configPrice(p, cfg).total;
  const cfgLabel = describeConfig(p, cfg, lang);
  const mat = materialsFor(p).find((m) => m.id === cfg.material);
  const swatch = mat?.colours.find((c) => c.id === cfg.colour);
  // Gallery: studio shot, then the piece in real rooms, then the original workshop photos.
  const gallery = [p.images[0], ...rooms.map((r) => r.image), ...p.images.slice(1)];
  const roomTitle = (src: string) => rooms.find((r) => r.image === src)?.title;
  // Square crops of wide room photos centre on this piece, not the middle of the room.
  const focus = (src: string) => {
    const r = rooms.find((r) => r.image === src);
    return r ? { objectPosition: `${r.x}% ${r.y}%` } : undefined;
  };
  // Estimated delivery date, computed on the client to avoid hydration drift.
  const [deliverBy, setDeliverBy] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date(Date.now() + (p.leadTimeDays + 2) * 864e5);
    setDeliverBy(d.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", { weekday: "short", day: "numeric", month: "short" }));
  }, [p.leadTimeDays, lang]);
  const liked = hydrated && wish.ids.includes(p.id);
  const lowStock = !p.priceOnRequest && p.stock > 0 && p.stock <= 3;
  const quoteHref = `/quote?service=custom&product=${encodeURIComponent(p.name.en)}`;
  const studio = (src: string) => src.includes("/products-v2/");

  const onAdd = () => {
    add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], price, finish: describeConfig(p, cfg, "en"), size: p.sizes[cfg.size], material: cfg.material, colour: cfg.colour }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    setTimeout(() => setCart(true), 350);
  };

  const step = (d: number) => setImg((i) => (i + d + gallery.length) % gallery.length);

  const BuyButton = ({ compact = false }: { compact?: boolean }) =>
    p.priceOnRequest ? (
      <Link href={quoteHref} className={clsx("flex items-center justify-center rounded-full bg-ink font-medium text-white transition hover:bg-ink-2", compact ? "h-11 px-6 text-[0.88rem]" : "h-[52px] w-full text-[0.95rem]")}>
        {t("shop.request")}
      </Link>
    ) : (
      <button onClick={onAdd} className={clsx("flex items-center justify-center gap-2 rounded-full font-medium text-white transition", added ? "bg-ink-2" : "bg-ink hover:bg-ink-2", compact ? "h-11 px-6 text-[0.88rem]" : "h-[52px] w-full text-[0.95rem]")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(added)} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="flex items-center gap-2 whitespace-nowrap">
            {added && <Check className="h-4 w-4" />}
            {added ? t("shop.added") : `${t("shop.add")}${compact ? "" : ` · ${money(price * qty, lang)}`}`}
          </motion.span>
        </AnimatePresence>
      </button>
    );

  const specs = [
    { id: "details", title: t("shop.details"), body: tx(p.description, lang) },
    { id: "materials", title: t("shop.materials"), body: tx(p.materials, lang) },
    { id: "dimensions", title: t("shop.dimensions"), body: p.dimensions },
    { id: "delivery", title: t("shop.delivery"), body: t("shop.deliveryD") },
  ];

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
        <nav className="mb-6 flex items-center gap-2 text-[0.82rem] text-muted">
          <Link href="/shop" className="hover:text-ink">{t("nav.shop")}</Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/shop?c=${category.slug}`} className="hover:text-ink">{tx(category.name, lang)}</Link>
              <span>/</span>
            </>
          )}
          <span className="truncate text-ink">{tx(p.name, lang)}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="flex gap-3 lg:sticky lg:top-24">
              {gallery.length > 1 && (
                <div className="no-scrollbar hidden max-h-[680px] w-20 shrink-0 flex-col gap-2 overflow-y-auto md:flex">
                  {gallery.map((src, i) => (
                    <button key={src} onClick={() => setImg(i)} className={clsx("relative aspect-square w-20 overflow-hidden bg-plate transition", img === i ? "ring-1 ring-ink" : "opacity-60 hover:opacity-100")}>
                      <Image src={src} alt="" fill sizes="80px" className={studio(src) ? "object-contain" : "object-cover"} style={focus(src)} />
                    </button>
                  ))}
                </div>
              )}
              <div className="relative min-w-0 flex-1">
                <div
                  className="relative aspect-square cursor-zoom-in overflow-hidden bg-plate"
                  onPointerMove={(e) => {
                    if (e.pointerType !== "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                  }}
                  onPointerLeave={() => setZoom(null)}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={img} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                      <Image
                        src={gallery[img]}
                        alt={tx(p.name, lang)}
                        fill
                        priority
                        sizes="(min-width:1024px) 55vw, 100vw"
                        className={clsx("transition-transform duration-300", studio(gallery[img]) ? "object-contain" : "object-cover")}
                        style={{ ...focus(gallery[img]), ...(zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : {}) }}
                      />
                    </motion.div>
                  </AnimatePresence>
                  {gallery.length > 1 && (
                    <div className="absolute bottom-4 end-4 flex gap-2 md:hidden">
                      <button onClick={() => step(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90" aria-label="Previous"><ChevronLeft className="h-4 w-4 rtl:rotate-180" /></button>
                      <button onClick={() => step(1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90" aria-label="Next"><ChevronRight className="h-4 w-4 rtl:rotate-180" /></button>
                    </div>
                  )}
                  {img > 0 && !studio(gallery[img]) && (
                    <span className="absolute start-4 top-4 bg-white/90 px-2.5 py-1 text-[0.72rem]">
                      {roomTitle(gallery[img]) ? `${lang === "ar" ? "في الغرفة" : "In the room"} · ${roomTitle(gallery[img])}` : lang === "ar" ? "صورة من مشروع منفّذ" : "As delivered to a client"}
                    </span>
                  )}
                  {/* Your chosen finish, as a fabric chip */}
                  {!p.priceOnRequest && swatch && studio(gallery[img]) && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={cfgLabel}
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="pointer-events-none absolute bottom-4 start-4 flex items-center gap-3 bg-white/95 py-2 pe-4 ps-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur"
                      >
                        <span className="h-10 w-10 rounded-full ring-1 ring-black/10" style={fabricStyle(swatch.hex, materialsFor(p)[0].id === "oak")} />
                        <span>
                          <span className="block text-[0.68rem] uppercase tracking-[0.14em] text-muted">{lang === "ar" ? "اختيارك" : "Your finish"}</span>
                          <span className="block text-[0.85rem] font-medium">{cfgLabel}</span>
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
                {gallery.length > 1 && (
                  <div className="mt-3 flex justify-center gap-1.5 md:hidden">
                    {gallery.map((_, i) => (
                      <span key={i} className={clsx("h-1 rounded-full transition-all", img === i ? "w-6 bg-ink" : "w-1.5 bg-line")} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Purchase panel */}
          <div className="lg:col-span-5">
            <Reveal>
              <div className="flex flex-wrap gap-2">
                {p.isNew && <span className="border border-ink/15 px-2 py-0.5 text-[0.72rem]">{t("shop.new")}</span>}
                {p.priceOnRequest && <span className="border border-ink/15 px-2 py-0.5 text-[0.72rem]">{t("shop.madeToOrder")}</span>}
              </div>
              <h1 className="mt-3 font-display text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]">{tx(p.name, lang)}</h1>
              <p className="mt-2 text-[0.88rem] text-muted">{tx(p.materials, lang)}</p>
              <div className="mt-5 flex items-baseline gap-3">
                {p.priceOnRequest ? (
                  <span className="text-[1.3rem] font-medium">{t("shop.onRequest")}</span>
                ) : (
                  <>
                    <AnimatedPrice value={price} className="text-[1.6rem] font-semibold" />
                    {p.salePrice && <span className="text-faint line-through">{money(p.price, lang)}</span>}
                    <span className="text-[0.8rem] text-muted">{t("shop.vatIncl")}</span>
                  </>
                )}
              </div>
              {!p.priceOnRequest && <Installments price={price} />}
            </Reveal>

            {!p.priceOnRequest && <Configurator product={p} cfg={cfg} setCfg={setCfg} />}

            <div ref={buyRef} className="mt-8 space-y-3">
              <div className="flex gap-3">
                {!p.priceOnRequest && (
                  <div className="flex h-[52px] items-center rounded-full border border-line">
                    <button className="px-4" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-"><Minus className="h-4 w-4" /></button>
                    <span className="w-5 text-center text-[0.95rem]">{qty}</span>
                    <button className="px-4" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="+"><Plus className="h-4 w-4" /></button>
                  </div>
                )}
                <BuyButton />
                <button onClick={() => wish.toggle(p.id)} className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-line transition hover:border-ink" aria-label="Wishlist">
                  <Heart className={clsx("h-5 w-5 stroke-[1.5]", liked && "fill-ink")} />
                </button>
              </div>
              {!p.priceOnRequest && (
                <Link href={quoteHref} className="flex h-[52px] items-center justify-center gap-2 rounded-full border border-line text-[0.92rem] font-medium transition hover:border-ink">
                  <Ruler className="h-4 w-4 stroke-[1.5]" /> {t("shop.custom")}
                </Link>
              )}
            </div>

            <ul className="mt-8 space-y-3 text-[0.88rem]">
              <li className="flex items-center gap-3">
                <Clock className="h-[18px] w-[18px] stroke-[1.5]" />
                {p.priceOnRequest ? (
                  t("shop.customD")
                ) : (
                  <span>
                    {t("shop.leadTime", { n: p.leadTimeDays })}
                    {deliverBy && (
                      <span className="text-muted">
                        {" · "}
                        {lang === "ar" ? "يصلك بحلول" : "delivered by"} <span className="font-medium text-ink">{deliverBy}</span>
                      </span>
                    )}
                  </span>
                )}
              </li>
              <li className="flex items-center gap-3">
                <span className={clsx("ms-1.5 me-1.5 h-2 w-2 rounded-full", lowStock ? "bg-brand" : "bg-emerald-500")} />
                {lowStock ? t("shop.lowStock", { n: p.stock }) : p.priceOnRequest ? t("shop.madeInUAE") : t("shop.inStock")}
              </li>
              <li className="flex items-center gap-3"><Truck className="h-[18px] w-[18px] stroke-[1.5]" />{t("shop.deliveryD")}</li>
              <li className="flex items-center gap-3"><ShieldCheck className="h-[18px] w-[18px] stroke-[1.5]" />{t("shop.warranty")}</li>
            </ul>

            <div className="mt-8 border-t border-line">
              {specs.map((a) => (
                <div key={a.id} className="border-b border-line">
                  <button onClick={() => setOpen(open === a.id ? null : a.id)} className="flex w-full items-center justify-between py-5 text-start text-[0.95rem] font-medium" aria-expanded={open === a.id}>
                    {a.title}
                    <Plus className={clsx("h-4 w-4 stroke-[1.5] transition-transform duration-500", open === a.id && "rotate-45")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open === a.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                        <p className="pb-5 font-serif text-[1.08rem] leading-relaxed text-ink-2">{a.body}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial spec sheet */}
      <section className="bg-band py-16 md:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal><p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{lang === "ar" ? "صُنع ليدوم" : "Made to last"}</p></Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.02em]">{tx(p.name, lang)}</h2>
            </Reveal>
            <Reveal delay={0.1}><p className="mt-5 max-w-xl font-serif text-[1.3rem] leading-relaxed text-ink-2">{tx(p.description, lang)}</p></Reveal>
          </div>
          <dl className="grid content-start gap-x-10 sm:grid-cols-2 lg:col-span-6">
            {[
              [t("shop.dimensions"), p.dimensions],
              [t("shop.materials"), tx(p.materials, lang)],
              [lang === "ar" ? "الخيارات" : "Finishes", p.finishes.map((f) => tx(f.name, lang)).join(", ") || "—"],
              [t("shop.size"), p.sizes.join(" · ") || "—"],
              [lang === "ar" ? "مدة التجهيز" : "Lead time", p.priceOnRequest ? t("shop.madeToOrder") : t("shop.leadTime", { n: p.leadTimeDays })],
              [lang === "ar" ? "الضمان" : "Warranty", t("shop.warranty")],
              [lang === "ar" ? "بلد الصنع" : "Made in", lang === "ar" ? "ورشتنا، مجمع دبي للاستثمار" : "Our workshop, Dubai Investment Park"],
              ["SKU", p.sku],
            ].map(([k, v], i) => (
              <Reveal key={k} delay={0.04 * i} className="border-t border-ink/10 py-4">
                <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-muted">{k}</dt>
                <dd className="mt-1.5 text-[0.95rem] leading-snug">{v}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-semibold tracking-[-0.02em]">{t("shop.related")}</h2>
              <ArrowLink href={`/shop?c=${p.category}`}>{t("common.viewAll")}</ArrowLink>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-10 lg:grid-cols-4">
              {related.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.06}>
                  <ProductCard product={r} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {!buyVisible && scrolled && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-3 md:px-10">
              <div className="relative hidden h-12 w-12 shrink-0 overflow-hidden bg-plate sm:block">
                <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9rem] font-medium">{tx(p.name, lang)}</p>
                <p className="text-[0.85rem] text-muted">{p.priceOnRequest ? t("shop.onRequest") : money(price, lang)}</p>
              </div>
              <BuyButton compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
