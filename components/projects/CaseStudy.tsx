"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSite } from "@/components/providers";
import { tx, emirateName } from "@/lib/i18n";
import type { Project } from "@/lib/types";
import { EASE, Reveal, SplitLines } from "@/components/ui/motion";
import { OutlineLink, PillLink } from "@/components/ui/buttons";
import { lockScroll } from "@/components/site/SmoothScroll";

export function CaseStudy({ project: p, next }: { project: Project; next: Project }) {
  const { t, lang } = useSite();
  const hero = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => lockScroll(lightbox !== null), [lightbox]);
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => ((i ?? 0) + 1) % p.images.length);
      if (e.key === "ArrowLeft") setLightbox((i) => ((i ?? 0) - 1 + p.images.length) % p.images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, p.images.length]);

  const facts = [
    { k: t("projects.client"), v: p.client },
    { k: t("projects.location"), v: tx(p.location, lang) },
    { k: t("projects.scope"), v: tx(p.scope, lang) },
    { k: t("projects.sector"), v: t(`projects.${p.sector}`) },
  ];

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 pt-8 md:px-10 md:pt-10">
        <Link href="/projects" className="group inline-flex items-center gap-2 text-[0.88rem] text-ink/70 hover:text-ink">
          <ArrowLeft className="h-4 w-4 stroke-[1.5] rtl:rotate-180" /> {t("projects.title")}
        </Link>
        <div className="mt-8 grid gap-6 md:mt-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8, ease: EASE }} className="font-serif text-[1.4rem] leading-none text-ink-2 md:text-[1.7rem]">
              {tx(p.title, lang)} · {emirateName(p.emirate, lang)}
            </motion.p>
            <h1 className="mt-2 font-display text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              <SplitLines immediate delay={0.2} lines={[p.client]} />
            </h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="max-w-md font-serif text-[1.15rem] leading-relaxed text-ink-2 lg:justify-self-end">
            {tx(p.summary, lang)}
          </motion.p>
        </div>
      </section>

      <div ref={hero} className="relative mx-auto mt-10 max-w-[1440px] md:px-10">
        <motion.div initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} transition={{ duration: 1.3, ease: EASE, delay: 0.3 }} className="relative aspect-[16/9] overflow-hidden bg-plate">
          {p.images[0] && (
            <motion.div style={{ y }} className="absolute inset-[-8%_0]">
              <Image src={p.images[0].src} alt={p.client} fill priority sizes="100vw" className="object-cover" />
            </motion.div>
          )}
        </motion.div>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
        <dl className="grid grid-cols-2 gap-6 border-y border-line py-8 md:grid-cols-4">
          {facts.map((f, i) => (
            <Reveal key={f.k} delay={i * 0.05}>
              <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-muted">{f.k}</dt>
              <dd className="mt-1.5 text-[1rem] font-medium">{f.v}</dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-14 grid gap-2 md:grid-cols-2">
          {p.images.slice(1).map((img, idx) => {
            const i = idx + 1;
            const wide = idx % 3 === 2;
            return (
              <Reveal key={img.src} delay={(idx % 2) * 0.08} className={wide ? "md:col-span-2" : ""}>
                <button onClick={() => setLightbox(i)} className="group relative block w-full overflow-hidden bg-plate" style={{ aspectRatio: wide ? "16/8" : "4/3" }} aria-label="Open image">
                  <Image src={img.src} alt={`${p.client} ${i + 1}`} fill sizes={wide ? "100vw" : "50vw"} className="object-cover transition duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />
                </button>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 bg-band p-8 md:flex-row md:items-center md:p-12">
          <div>
            <p className="font-serif text-[1.5rem] leading-none text-ink-2">{t("projects.similar")}</p>
            <p className="mt-2 font-display text-[1.6rem] font-semibold tracking-tight">{t("v2.helpTitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PillLink href="/quote">{t("nav.quote")}</PillLink>
            <OutlineLink href="/contact">{t("nav.contact")}</OutlineLink>
          </div>
        </div>
      </section>

      <Link href={`/projects/${next.slug}`} className="group block border-t border-line">
        <div className="mx-auto grid max-w-[1440px] items-center gap-6 px-5 py-12 md:grid-cols-[1fr_auto] md:px-10 md:py-16">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-muted">{t("projects.next")}</p>
            <p className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] font-semibold leading-none tracking-[-0.03em] transition group-hover:translate-x-2 rtl:group-hover:-translate-x-2">{next.client}</p>
          </div>
          <div className="relative hidden aspect-[16/10] w-72 overflow-hidden bg-plate md:block">
            {next.images[0] && <Image src={next.images[0].src} alt="" fill sizes="300px" className="object-cover transition duration-1000 group-hover:scale-105" />}
          </div>
        </div>
      </Link>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-white p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
            <motion.div key={lightbox} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }} className="relative h-[82vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <Image src={p.images[lightbox].src} alt="" fill sizes="100vw" className="object-contain" />
            </motion.div>
            <button className="absolute end-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white" onClick={() => setLightbox(null)} aria-label="Close"><X className="h-5 w-5 stroke-[1.5]" /></button>
            {p.images.length > 1 && (
              <>
                <button className="absolute start-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + p.images.length) % p.images.length); }} aria-label="Previous"><ChevronLeft className="h-5 w-5 rtl:rotate-180" /></button>
                <button className="absolute end-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % p.images.length); }} aria-label="Next"><ChevronRight className="h-5 w-5 rtl:rotate-180" /></button>
              </>
            )}
            <p className="absolute bottom-5 text-[0.85rem] text-muted" dir="ltr">{lightbox + 1} / {p.images.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
