"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSite } from "@/components/providers";
import { PageHero } from "@/components/site/PageHero";
import { EASE, Reveal, SplitLines } from "@/components/ui/motion";
import { ArrowLink, PillLink } from "@/components/ui/buttons";
import { HelpCTA } from "@/components/home/Home";

const CAPS = {
  fitout: {
    en: ["Concept & 3D visualisation", "Shop drawings & mall/authority approvals", "Gypsum ceilings, partitions & flooring", "Joinery, cladding & feature walls", "MEP, lighting & signage coordination", "Turnkey, snag-free handover"],
    ar: ["التصور والتصميم ثلاثي الأبعاد", "الرسومات التنفيذية وموافقات المولات والجهات", "أسقف جبسية وفواصل وأرضيات", "نجارة وتكسيات وجدران مميزة", "تنسيق التمديدات والإضاءة واللوحات", "تسليم متكامل بدون ملاحظات"],
  },
  furniture: {
    en: ["Bespoke sofas, beds & upholstery", "Retail display units, gondolas & counters", "Kiosks designed for mall approval", "Veneer, lacquer & solid-wood finishing", "Wardrobes, kitchens & built-in joinery", "Volume supply for hospitality & accommodation"],
    ar: ["كنب وأسرّة وتنجيد حسب الطلب", "وحدات عرض وجندولات وكاونترات للمحلات", "أكشاك مصممة لموافقة المولات", "تشطيب بالقشرة واللاكر والخشب الطبيعي", "خزائن ومطابخ ونجارة مدمجة", "توريد بكميات للضيافة والسكن"],
  },
  technical: {
    en: ["Annual maintenance contracts", "Electrical, plumbing & HVAC works", "Partition & layout modifications", "Painting, tiling & repairs", "Emergency call-outs", "Pre-handover & post-occupancy fixes"],
    ar: ["عقود صيانة سنوية", "أعمال الكهرباء والسباكة والتكييف", "تعديلات الفواصل والمخططات", "دهانات وبلاط وإصلاحات", "خدمة الطوارئ", "إصلاحات قبل وبعد التسليم"],
  },
};
const IMAGES = {
  fitout: "/images/projects/hovi-digital-lab-1.jpg",
  furniture: "/images/projects/vox-cinema-theatre-1.jpg",
  technical: "/images/projects/55-car-care-1.jpg",
};

function ServiceBlock({ k, i }: { k: keyof typeof CAPS; i: number }) {
  const { t, lang } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const rot = useTransform(scrollYProgress, [0, 0.5, 1], [i % 2 ? -4 : 4, 0, i % 2 ? 2 : -2]);
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-2 lg:gap-20">
        <div ref={ref} className={i % 2 ? "lg:order-2" : ""} style={{ perspective: 1400 }}>
          <motion.div style={{ rotateY: rot }} initial={{ clipPath: "inset(12% 12% 12% 12%)" }} whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }} viewport={{ once: true, margin: "-15%" }} transition={{ duration: 1.3, ease: EASE }} className="relative aspect-[4/3.4] overflow-hidden bg-plate">
            <motion.div style={{ y }} className="absolute inset-[-8%_0]">
              <Image src={IMAGES[k]} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </div>
        <div>
          <Reveal><p className="font-serif text-[1.4rem] leading-none text-ink-2" dir="ltr">0{i + 1}</p></Reveal>
          <h2 className="mt-2 font-display text-[clamp(2rem,3.6vw,3rem)] font-semibold tracking-[-0.03em]">
            <SplitLines lines={[t(`services.${k}`)]} />
          </h2>
          <Reveal delay={0.1}><p className="mt-4 max-w-lg font-serif text-[1.2rem] leading-relaxed text-ink-2">{t(`services.${k}D`)}</p></Reveal>
          <ul className="mt-8 border-t border-line">
            {CAPS[k][lang].map((c, j) => (
              <Reveal as="li" key={c} delay={0.1 + j * 0.04} className="flex items-center gap-3 border-b border-line py-3.5 text-[0.95rem]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {c}
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3} className="mt-8"><ArrowLink href={`/quote?service=${k}`}>{t("nav.quote")}</ArrowLink></Reveal>
        </div>
      </div>
    </section>
  );
}

export function ServicesView() {
  const { t, lang } = useSite();
  const steps = [1, 2, 3, 4, 5] as const;
  return (
    <>
      <PageHero eyebrow={t("home.servicesEyebrow")} title={[t("home.servicesTitle")]} sub={t("about.objectivesD")} />
      {(["fitout", "furniture", "technical"] as const).map((k, i) => (
        <ServiceBlock key={k} k={k} i={i} />
      ))}

      <section className="bg-band py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal><p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{t("home.processEyebrow")}</p></Reveal>
          <h2 className="mt-1 max-w-2xl font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
            <SplitLines lines={[t("home.processTitle")]} />
          </h2>
          <ol className="mt-12 grid gap-px overflow-hidden bg-ink/10 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((n, i) => (
              <Reveal as="li" key={n} delay={i * 0.07} className="bg-band p-6 md:p-8">
                <span className="font-serif text-[2.4rem] leading-none text-ink/30" dir="ltr">0{n}</span>
                <h3 className="mt-6 font-display text-[1.25rem] font-semibold">{t(`process.s${n}`)}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{t(`process.s${n}d`)}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-10"><PillLink href="/quote">{lang === "ar" ? "ابدأ مشروعك" : "Start your project"}</PillLink></div>
        </div>
      </section>

      <HelpCTA />
    </>
  );
}
