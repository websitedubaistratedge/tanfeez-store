"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { EASE } from "@/components/ui/motion";
import { CircleArrow } from "@/components/ui/buttons";
import { LEGAL_UPDATED, privacy, returnsPolicy, terms, type LegalBlock } from "@/lib/legal";

const DOCS = { terms, privacy, returns: returnsPolicy } as const;
export type LegalKind = keyof typeof DOCS;

const PAGES: { kind: LegalKind; href: string; en: string; ar: string }[] = [
  { kind: "terms", href: "/terms", en: "Terms of sale", ar: "شروط البيع" },
  { kind: "returns", href: "/returns", en: "Returns & refunds", ar: "الإرجاع والاسترداد" },
  { kind: "privacy", href: "/privacy", en: "Privacy policy", ar: "سياسة الخصوصية" },
];

export function LegalView({ kind }: { kind: LegalKind }) {
  const { lang, settings } = useSite();
  const ar = lang === "ar";
  const pathname = usePathname();
  const doc = DOCS[kind](ar, settings);
  const [active, setActive] = useState(doc.sections[0]?.id);

  // Highlight the section being read in the side index.
  useEffect(() => {
    const els = doc.sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [doc.sections]);

  const updated = new Date(LEGAL_UPDATED).toLocaleDateString(ar ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <section className="bg-band">
        <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10 md:pb-16 md:pt-10">
          <Link href="/" className="group inline-flex items-center gap-2 text-[0.88rem] text-ink/70 hover:text-ink">
            <ArrowLeft className="h-4 w-4 stroke-[1.5] transition group-hover:-translate-x-0.5 rtl:rotate-180" />
            {ar ? "الرئيسية" : "Home"}
          </Link>
          <div className="mt-8 grid gap-6 md:mt-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="font-serif text-[1.35rem] leading-none text-ink-2 md:text-[1.6rem]">
                {ar ? `آخر تحديث ${updated}` : `Last updated ${updated}`}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.9, ease: EASE }} className="mt-3 font-display text-[clamp(2.4rem,6vw,4.6rem)] font-semibold leading-[1] tracking-[-0.035em]">
                {doc.title}
              </motion.h1>
            </div>
            <p className="max-w-xl font-serif text-[1.15rem] leading-relaxed text-ink-2">{doc.intro}</p>
          </div>
          <nav className="no-scrollbar -mx-5 mt-9 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0" aria-label={ar ? "السياسات" : "Policies"}>
            {PAGES.map((p) => (
              <Link key={p.href} href={p.href} className={clsx("shrink-0 rounded-full px-4 py-2 text-[0.86rem] transition", pathname === p.href ? "bg-ink text-white" : "bg-white/70 text-ink/70 hover:bg-white hover:text-ink")}>
                {ar ? p.ar : p.en}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-28 pt-10 md:px-10 md:pt-14 lg:grid-cols-[260px_1fr] lg:gap-20">
        {/* Index: a drop-down on phones, sticky list on desktop */}
        <details className="group rounded-2xl border border-line lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-[0.92rem] font-medium">
            {ar ? "في هذه الصفحة" : "On this page"}
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <ol className="border-t border-line px-4 py-2">
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex gap-3 py-2 text-[0.9rem] text-ink-2" onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}>
                  <span className="w-5 text-faint tabular-nums" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </details>
        <nav className="hidden lg:block">
          <ol className="sticky top-28 space-y-0.5 border-s border-line">
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={clsx("-ms-px flex gap-3 border-s py-1.5 ps-4 text-[0.88rem] transition", active === s.id ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink")}>
                  <span className="w-5 text-[0.78rem] tabular-nums text-faint" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 max-w-[72ch]">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 border-b border-line py-8 first:pt-0 last:border-0">
              <h2 className="flex items-baseline gap-3 font-display text-[1.35rem] font-semibold tracking-[-0.02em] md:text-[1.5rem]">
                <span className="font-serif text-[1.2rem] font-normal text-faint" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="mt-4 space-y-4 text-[0.98rem] leading-[1.75] text-ink-2">
                {s.body.map((b, k) => <Block key={k} b={b} />)}
              </div>
            </section>
          ))}

          <div className="mt-10 flex flex-col gap-5 rounded-2xl bg-band p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div>
              <p className="font-display text-[1.15rem] font-semibold">{ar ? "لديك سؤال؟" : "Have a question?"}</p>
              <p className="mt-1 text-[0.92rem] text-muted">{ar ? "فريقنا يسعده المساعدة، عادةً خلال ساعات قليلة." : "Our team is happy to help, usually within a few hours."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-[0.88rem] font-medium text-white transition hover:bg-ink-2">WhatsApp</a>
              <Link href="/contact" className="group inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 px-5 text-[0.88rem] font-medium transition hover:border-ink">
                {ar ? "تواصل معنا" : "Contact us"} <CircleArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

function Block({ b }: { b: LegalBlock }) {
  if (typeof b === "string") return <p>{b}</p>;
  return (
    <ul className="space-y-2.5">
      {b.list.map((li) => (
        <li key={li} className="flex gap-3">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span>{li}</span>
        </li>
      ))}
    </ul>
  );
}
