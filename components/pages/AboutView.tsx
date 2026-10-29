"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useSite } from "@/components/providers";
import { PageHero } from "@/components/site/PageHero";
import { EASE, Reveal, SplitLines } from "@/components/ui/motion";
import { Clients, HelpCTA, Heritage } from "@/components/home/Home";
import { emirateName } from "@/lib/i18n";

const PLACES = [
  { e: "Ras Al Khaimah", x: 79, y: 14 },
  { e: "Umm Al Quwain", x: 70, y: 24 },
  { e: "Ajman", x: 66, y: 30 },
  { e: "Sharjah", x: 63, y: 35 },
  { e: "Fujairah", x: 90, y: 34 },
  { e: "Dubai", x: 55, y: 42, hq: true },
  { e: "Abu Dhabi", x: 28, y: 66 },
];

export function AboutView({ projectCount }: { projectCount: number }) {
  const { t, lang, settings } = useSite();
  const hq = PLACES.find((p) => p.hq)!;
  const pillars = ["mission", "vision", "goal", "objectives"] as const;

  return (
    <>
      <PageHero eyebrow={t("about.meaning")} title={[t("about.title")]} sub={t("about.sub")} />

      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-2 md:grid-cols-[1.4fr_1fr]">
          <Reveal className="relative aspect-[4/3] overflow-hidden bg-plate">
            <Image src="/images/craft/craftsman.jpg" alt="" fill sizes="60vw" className="object-cover" />
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden bg-plate md:aspect-auto">
            <Image src="/images/craft/workshop.jpg" alt="" fill sizes="40vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1440px] px-5 md:grid-cols-2 md:px-10">
          {pillars.map((k, i) => (
            <Reveal key={k} delay={(i % 2) * 0.08} className="border-b border-line py-10 md:py-14 md:odd:border-e md:odd:pe-12 md:even:ps-12">
              <p className="font-serif text-[1.6rem] leading-none text-ink-2">{t(`about.${k}`)}</p>
              <p className="mt-4 max-w-lg font-display text-[1.3rem] font-medium leading-snug tracking-tight md:text-[1.5rem]">{t(`about.${k}D`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 md:px-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
              <SplitLines lines={[t("about.coverage")]} />
            </h2>
            <Reveal delay={0.1}><p className="mt-4 max-w-md font-serif text-[1.2rem] leading-relaxed text-ink-2">{t("about.coverageD")}</p></Reveal>
            <Reveal delay={0.2} className="mt-8 flex items-start gap-3 border-t border-line pt-6">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 stroke-[1.5]" />
              <div>
                <p className="font-medium">{t("about.hq")}</p>
                <p className="text-muted">{settings.address}</p>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <div className="relative aspect-square overflow-hidden bg-band">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                {PLACES.filter((p) => !p.hq).map((p, i) => (
                  <motion.path
                    key={p.e}
                    d={`M${hq.x} ${hq.y} Q${(p.x + hq.x) / 2} ${Math.min(p.y, hq.y) - 12} ${p.x} ${p.y}`}
                    fill="none"
                    stroke="#1a1a1a"
                    strokeOpacity={0.35}
                    strokeWidth={0.25}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: 0.3 + i * 0.12, ease: EASE }}
                  />
                ))}
              </svg>
              {PLACES.map((p, i) => (
                <motion.div key={p.e} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1, type: "spring" }}>
                  <span className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${p.hq ? "h-3.5 w-3.5 bg-brand ring-4 ring-brand/25" : "h-2 w-2 bg-ink"}`} />
                  <span className={`absolute whitespace-nowrap text-[11px] md:text-xs ${p.hq ? "font-semibold" : "text-ink/70"} ${p.x > 75 ? "right-3" : "left-3"} -translate-y-1/2`}>{emirateName(p.e, lang)}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Clients />
      <Heritage projectCount={projectCount} />
      <HelpCTA />
    </>
  );
}
