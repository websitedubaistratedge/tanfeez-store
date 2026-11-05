"use client";

import { motion } from "framer-motion";
import { EASE, SplitLines } from "@/components/ui/motion";
import { useSite } from "@/components/providers";
import { BackButton } from "@/components/ui/BackButton";

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
        <BackButton fallback={b.href} />
        <div className="mt-8 grid gap-8 md:mt-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            {eyebrow && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8, ease: EASE }} className="font-serif text-[1.4rem] leading-none text-ink-2 md:text-[1.48rem]">
                {eyebrow}
              </motion.p>
            )}
            <h1 className="mt-2 font-display text-[clamp(1.92rem,4.8vw,4rem)] font-semibold leading-[1] tracking-[-0.035em]">
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
