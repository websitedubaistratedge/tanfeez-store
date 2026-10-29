"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { CountUp, EASE, Reveal, SplitLines } from "@/components/ui/motion";
import { CircleArrow, OutlineLink, PillLink } from "@/components/ui/buttons";
import { Clients, ProjectsShowcase } from "@/components/home/Home";
import type { Project, Sector } from "@/lib/types";

const SECTORS: { id: Sector; en: string; ar: string; dEn: string; dAr: string }[] = [
  { id: "retail", en: "Retail & luxury", ar: "التجزئة والفخامة", dEn: "Flagships, department-store concessions, kiosks", dAr: "متاجر رئيسية وأقسام داخل المولات وأكشاك" },
  { id: "fnb", en: "Food & beverage", ar: "المطاعم والمقاهي", dEn: "Restaurants, cafés, gourmet halls", dAr: "مطاعم ومقاهٍ وقاعات ذواقة" },
  { id: "hospitality", en: "Hospitality & leisure", ar: "الضيافة والترفيه", dEn: "Cinemas, lounges, hotel suites", dAr: "سينمات وصالات وأجنحة فندقية" },
  { id: "office", en: "Workplace", ar: "بيئات العمل", dEn: "Offices, studios, showrooms", dAr: "مكاتب واستوديوهات وصالات عرض" },
  { id: "accommodation", en: "Government & accommodation", ar: "الحكومي والسكن", dEn: "Staff housing, public facilities", dAr: "سكن الموظفين والمرافق العامة" },
  { id: "automotive", en: "Automotive", ar: "السيارات", dEn: "Service centres, detailing studios", dAr: "مراكز خدمة واستوديوهات عناية" },
];

const STEPS = {
  en: [
    ["Brief & site visit", "Within 48 hours we're on site: measuring, photographing, and listening to how the space needs to perform."],
    ["Concept & 3D", "Moodboards, layouts and photoreal renders, so you sign off on exactly what you'll walk into."],
    ["Drawings & approvals", "Shop drawings, MEP coordination, and mall and authority approvals handled by our own team."],
    ["Built in our workshop", "Joinery, upholstery and metalwork made in-house in Dubai, so quality and timeline stay in our hands."],
    ["Install & handover", "One crew installs, snags and hands over, then stays on call with maintenance contracts."],
  ],
  ar: [
    ["الموجز وزيارة الموقع", "خلال 48 ساعة نكون في الموقع: نقيس ونصوّر ونفهم كيف يجب أن تعمل المساحة."],
    ["التصور والتصميم ثلاثي الأبعاد", "لوحات إلهام ومخططات وتصاميم واقعية لتعتمد بالضبط ما ستراه."],
    ["الرسومات والموافقات", "رسومات تنفيذية وتنسيق التمديدات وموافقات المولات والجهات عبر فريقنا."],
    ["التصنيع في ورشتنا", "نجارة وتنجيد وأعمال معدنية داخل ورشتنا في دبي، فتبقى الجودة والمواعيد بأيدينا."],
    ["التركيب والتسليم", "فريق واحد يركّب ويسلّم دون ملاحظات، ويبقى متاحاً بعقود الصيانة."],
  ],
};

const CAPS = [
  { href: "/services", img: "/images/projects/hovi-digital-lab-1.jpg", en: "Turnkey fit-out", ar: "تجهيز متكامل", dEn: "Design, build and handover under one contract.", dAr: "تصميم وتنفيذ وتسليم بعقد واحد." },
  { href: "/services", img: "/images/craft/workshop.jpg", en: "Joinery & contract furniture", ar: "نجارة وأثاث للمشاريع", dEn: "Counters, display units, seating in volume.", dAr: "كاونترات ووحدات عرض ومقاعد بالكميات." },
  { href: "/services", img: "/images/projects/55-car-care-1.jpg", en: "Technical & maintenance", ar: "الخدمات الفنية والصيانة", dEn: "MEP, AMCs and post-occupancy care.", dAr: "تمديدات وعقود صيانة ورعاية بعد التشغيل." },
];

export function BusinessView({ projects }: { projects: Project[] }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const featured = projects.filter((p) => p.featured);
  return (
    <>
      <BizHero projects={projects} />
      <Stats count={projects.length} />
      <Sectors projects={projects} />
      <Process />
      <ProjectsShowcase projects={featured.length ? featured : projects} />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <h2 className="mb-10 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
            <SplitLines lines={[ar ? "قدرات تحت سقف واحد" : "Capabilities under one roof"]} />
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {CAPS.map((c, i) => (
              <Reveal key={c.en} delay={i * 0.08}>
                <Link href={c.href} className="group block">
                  <div className="relative aspect-[4/3.3] overflow-hidden bg-plate">
                    <Image src={c.img} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition duration-[1600ms] ease-out group-hover:scale-[1.06]" />
                    <span className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 transition duration-500 group-hover:opacity-100">
                      <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                    </span>
                  </div>
                  <p className="mt-4 font-display text-[1.25rem] font-semibold tracking-tight">{ar ? c.ar : c.en}</p>
                  <p className="mt-1 text-[0.92rem] text-muted">{ar ? c.dAr : c.dEn}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Clients />
      <ClosingCTA />
    </>
  );
}

/* Hero: headline over three columns of projects drifting at different speeds. */
function BizHero({ projects }: { projects: Project[] }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const imgs = projects.map((p) => p.images[0]?.src).filter(Boolean) as string[];
  const cols = [0, 1, 2].map((c) => imgs.filter((_, i) => i % 3 === c).slice(0, 6));
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const lift = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-10 md:px-10 md:pt-14 lg:min-h-[calc(100svh-120px)] lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-0">
        <motion.div style={{ y: lift }} className="lg:col-span-6">
          <p className="fade-up font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{ar ? "تنفيذ للأعمال" : "TANFEEZ for business"}</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
            <SplitLines lines={ar ? ["نبني المساحات", "التي تعيش فيها", "العلامات التجارية."] : ["We build the", "spaces brands", "live in."]} />
          </h1>
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-[34rem] font-serif text-[1.2rem] leading-relaxed text-ink-2 md:text-[1.3rem]">
              {ar
                ? "تجهيز داخلي متكامل وأثاث للمشاريع لعلامات مثل غاليري لافاييت وفوكس سينما وهارفي نيكولز، من الفكرة إلى التسليم بفريق واحد."
                : "Turnkey fit-out and contract furniture for names like Galeries Lafayette, VOX Cinemas and Harvey Nichols, from first sketch to handover with one team."}
            </p>
          </Reveal>
          <Reveal delay={0.4} className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/quote?service=fitout">{ar ? "اطلب عرضاً" : "Request a proposal"}</PillLink>
            <OutlineLink href="/projects">{ar ? "شاهد مشاريعنا" : "See our projects"}</OutlineLink>
          </Reveal>
        </motion.div>

        {/* Drifting project reel */}
        <div className="relative -mx-5 h-[360px] overflow-hidden md:mx-0 md:h-[520px] lg:col-span-6 lg:h-[calc(100svh-120px)]" dir="ltr">
          <div className="absolute inset-0 grid grid-cols-3 gap-3 px-5 md:px-0">
            {cols.map((col, c) => (
              <div key={c} className="relative overflow-hidden">
                <div className={clsx("flex flex-col gap-3", c === 1 ? "biz-reel-down" : "biz-reel-up")} style={{ animationDuration: `${46 + c * 8}s` }}>
                  {[...col, ...col].map((src, i) => (
                    <div key={i} className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-plate">
                      <Image src={src} alt="" fill sizes="(min-width:1024px) 16vw, 33vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}

function Stats({ count }: { count: number }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const stats = [
    { v: count, s: "+", l: ar ? "مشروع رئيسي منفّذ" : "Flagship projects delivered" },
    { v: 7, s: "", l: ar ? "إمارات نعمل فيها" : "Emirates we build in" },
    { v: 48, s: ar ? " ساعة" : "h", l: ar ? "من الاتصال إلى زيارة الموقع" : "From call to site visit" },
    { v: 100, s: "%", l: ar ? "نجارة وتنجيد داخلي" : "Joinery & upholstery in-house" },
  ];
  return (
    <section className="bg-band">
      <dl className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 md:px-10 md:py-16 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.06} className="border-t border-ink pt-4">
            <dd className="font-display text-[clamp(2.4rem,4vw,3.4rem)] font-semibold leading-none tracking-[-0.04em]">
              <CountUp to={s.v} suffix={s.s} />
            </dd>
            <dt className="mt-2 text-[0.88rem] text-muted">{s.l}</dt>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

/* Sectors: big type list; a project photo trails the cursor on hover. */
function Sectors({ projects }: { projects: Project[] }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const [hover, setHover] = useState<Sector | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 24 });
  const y = useSpring(my, { stiffness: 180, damping: 24 });
  const cover = (s: Sector) => projects.find((p) => p.sector === s && p.featured)?.images[0]?.src ?? projects.find((p) => p.sector === s)?.images[0]?.src;
  const count = (s: Sector) => projects.filter((p) => p.sector === s).length;
  const list = SECTORS.filter((s) => count(s.id) > 0);

  return (
    <section className="py-16 md:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-10 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-serif text-[1.5rem] leading-none text-ink-2 md:text-[1.8rem]">{ar ? "القطاعات" : "Sectors"}</p>
            <h2 className="mt-1 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em]">
              <SplitLines lines={[ar ? "مساحات نعرفها جيداً" : "Spaces we know by heart"]} />
            </h2>
          </div>
        </div>

        <div
          ref={box}
          className="relative"
          onPointerMove={(e) => {
            const r = box.current!.getBoundingClientRect();
            mx.set(e.clientX - r.left);
            my.set(e.clientY - r.top);
          }}
          onPointerLeave={() => setHover(null)}
        >
          <ul className="border-t border-line">
            {list.map((s, i) => (
              <li key={s.id}>
                <Link
                  href={`/projects?sector=${s.id}`}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHover(s.id)}
                  className="group grid grid-cols-[2.2rem_1fr_auto] items-center gap-4 border-b border-line py-5 md:grid-cols-[3rem_1fr_1fr_auto] md:py-7"
                >
                  <span className="font-serif text-[1.1rem] text-muted" dir="ltr">0{i + 1}</span>
                  <span className={clsx("font-display text-[clamp(1.5rem,3.4vw,2.9rem)] font-semibold leading-none tracking-[-0.03em] transition duration-500", hover && hover !== s.id ? "text-ink/25" : "text-ink", "group-hover:translate-x-2 rtl:group-hover:-translate-x-2")}>
                    {ar ? s.ar : s.en}
                  </span>
                  <span className="hidden text-[0.92rem] text-muted md:block">{ar ? s.dAr : s.dEn}</span>
                  <span className="flex items-center gap-3 text-[0.85rem] text-muted tabular-nums">
                    {count(s.id)} {ar ? "مشاريع" : count(s.id) === 1 ? "project" : "projects"}
                    <CircleArrow className="h-8 w-8 opacity-0 transition group-hover:opacity-100" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Cursor-trailing preview (desktop pointers only) */}
          <motion.div style={{ x, y }} className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block">
            <AnimatePresence>
              {hover && (
                <motion.div
                  key={hover}
                  initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 4 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute translate-x-8 -translate-y-1/2 overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
                  style={{ width: 300, height: 220 }}
                >
                  {cover(hover) && <Image src={cover(hover)!} alt="" fill sizes="300px" className="object-cover" />}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* Process: sticky title, steps light up as a line draws down the page. */
function Process() {
  const { lang } = useSite();
  const ar = lang === "ar";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const steps = STEPS[lang];

  return (
    <section id="process" className="scroll-mt-24 bg-ink py-20 text-white md:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="font-serif text-[1.5rem] leading-none text-white/60 md:text-[1.8rem]">{ar ? "كيف نعمل" : "How we work"}</p>
            <h2 className="mt-2 font-display text-[clamp(2rem,3.6vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <SplitLines lines={ar ? ["فريق واحد،", "من الرسم إلى التسليم."] : ["One team,", "sketch to handover."]} />
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md font-serif text-[1.15rem] leading-relaxed text-white/65">
                {ar ? "لا وسطاء ولا مقاولين من الباطن للنجارة. لهذا نلتزم بمواعيد افتتاح المولات." : "No middlemen and no subcontracted joinery. That's how we hit mall opening dates."}
              </p>
            </Reveal>
          </div>
        </div>
        <div ref={ref} className="relative lg:col-span-7">
          <div className="absolute bottom-2 start-[15px] top-2 w-px bg-white/15" />
          <motion.div style={{ scaleY: line }} className="absolute bottom-2 start-[15px] top-2 w-px origin-top bg-brand" />
          <ol className="space-y-12 md:space-y-16">
            {steps.map(([title, d], i) => (
              <Step key={title} i={i} n={steps.length} title={title} d={d} progress={line} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({ i, n, title, d, progress }: { i: number; n: number; title: string; d: string; progress: ReturnType<typeof useSpring> }) {
  const at = i / (n - 1 || 1);
  const on = useTransform(progress, [Math.max(0, at - 0.08), at], [0, 1]);
  const dim = useTransform(on, [0, 1], [0.35, 1]);
  return (
    <li className="relative ps-14">
      <span className="absolute start-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-ink text-[0.8rem] tabular-nums">
        <motion.span style={{ opacity: on }} className="absolute inset-0 rounded-full bg-brand" />
        <motion.span style={{ opacity: on }} className="relative text-ink" dir="ltr">0{i + 1}</motion.span>
        <motion.span style={{ opacity: useTransform(on, [0, 1], [1, 0]) }} className="absolute text-white/70" dir="ltr">0{i + 1}</motion.span>
      </span>
      <motion.div style={{ opacity: dim }}>
        <h3 className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="mt-2 max-w-lg text-[1rem] leading-relaxed text-white/70">{d}</p>
      </motion.div>
    </li>
  );
}

function ClosingCTA() {
  const { lang, settings } = useSite();
  const ar = lang === "ar";
  return (
    <section className="px-4 py-16 md:px-10 md:py-24">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden bg-band px-6 py-16 md:px-16 md:py-24">
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-display text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1] tracking-[-0.035em]">
            <SplitLines lines={ar ? ["تفتتح فرعاً جديداً؟", "لنبنِه معاً."] : ["Opening a new space?", "Let's build it."]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-lg font-serif text-[1.2rem] leading-relaxed text-ink-2">
              {ar ? "أرسل المخطط أو حتى صورة للموقع، وسنعود إليك بعرض مبدئي خلال يومي عمل." : "Send a floor plan, or even a photo of the site, and we'll come back with an initial proposal within two working days."}
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/quote?service=fitout">{ar ? "اطلب عرضاً" : "Request a proposal"}</PillLink>
            {settings?.phone && <OutlineLink href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</OutlineLink>}
          </Reveal>
        </div>
        <div className="pointer-events-none absolute -bottom-10 end-[-4%] hidden w-[46%] lg:block" aria-hidden>
          <p className="select-none font-display text-[clamp(8rem,16vw,15rem)] font-bold leading-none tracking-[-0.06em] text-ink/[0.05]" dir="ltr">تنفيذ</p>
        </div>
      </div>
    </section>
  );
}

