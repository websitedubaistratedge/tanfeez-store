"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { EASE, SplitLines } from "@/components/ui/motion";
import { useSite } from "@/components/providers";

/** Inner-page header: Natuzzi-style warm band; content below can overlap its lower edge. */
export function PageHero({
  eyebrow,
  title,
  sub,
  children,
  back,
  overlap = false,
}: {
  eyebrow?: string;
  title: React.ReactNode[];
  sub?: string;
  children?: React.ReactNode;
  back?: { href: string; label: string };
  overlap?: boolean;
  compact?: boolean;
}) {
  const { t } = useSite();
  const b = back ?? { href: "/", label: t("nav.home") };
  return (
    <section className={`bg-band ${overlap ? "pb-28 md:pb-36" : "pb-12 md:pb-16"}`}>
      <div className="mx-auto max-w-[1440px] px-5 pt-8 md:px-10 md:pt-10">
        <Link href={b.href} className="group inline-flex items-center gap-2 text-[0.88rem] text-ink/70 hover:text-ink">
          <ArrowLeft className="h-4 w-4 stroke-[1.5] transition group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
          {b.label}
        </Link>
        <div className="mt-8 grid gap-8 md:mt-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            {eyebrow && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8, ease: EASE }} className="font-serif text-[1.4rem] leading-none text-ink-2 md:text-[1.7rem]">
                {eyebrow}
              </motion.p>
            )}
            <h1 className="mt-2 font-display text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1] tracking-[-0.035em]">
              <SplitLines immediate delay={0.2} lines={title} />
            </h1>
          </div>
          {sub && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: EASE }} className="max-w-md font-serif text-[1.15rem] leading-relaxed text-ink-2 lg:justify-self-end">
              {sub}
            </motion.p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
