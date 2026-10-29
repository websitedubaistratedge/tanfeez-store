"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { PageHero } from "@/components/site/PageHero";
import { tx } from "@/lib/i18n";
import type { Project, Sector } from "@/lib/types";
import { EASE } from "@/components/ui/motion";

export function ProjectsView({ projects, initialSector }: { projects: Project[]; initialSector?: string }) {
  const { t, lang } = useSite();
  const sectors = useMemo(() => Array.from(new Set(projects.map((p) => p.sector))), [projects]);
  const [sector, setSector] = useState<Sector | "all">(sectors.find((s) => s === initialSector) ?? "all");
  const list = sector === "all" ? projects : projects.filter((p) => p.sector === sector);

  return (
    <>
      <PageHero overlap eyebrow={t("v2.projectsSerif")} title={[t("projects.title")]} sub={t("projects.sub")} />

      <section className="relative mx-auto -mt-20 max-w-[1440px] px-5 pb-24 md:-mt-24 md:px-10">
        <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 md:mx-0 md:mb-8 md:px-0">
          {(["all", ...sectors] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={clsx("h-10 shrink-0 rounded-full border px-4 text-[0.88rem] transition", sector === s ? "border-ink bg-ink text-white" : "border-ink/15 bg-white hover:border-ink")}
            >
              {t(`projects.${s}` as "projects.all")}
              <span className="ms-1.5 opacity-50">{s === "all" ? projects.length : projects.filter((p) => p.sector === s).length}</span>
            </button>
          ))}
        </div>

        {/* Phones: a two-column gallery with every fifth project shown wide, for rhythm */}
        <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-7 md:gap-x-6 md:gap-y-12">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: Math.min(i, 4) * 0.05 }}
                className={clsx(i % 5 === 0 ? "col-span-2" : "col-span-1", "md:col-span-1")}
              >
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className={clsx("relative overflow-hidden bg-plate md:aspect-[16/10]", i % 5 === 0 ? "aspect-[16/10]" : "aspect-[4/5]")}>
                    {p.images[0] && (
                      <Image src={p.images[0].src} alt={p.client} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition duration-[1.4s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]" />
                    )}
                    {p.images[1] && (
                      <Image src={p.images[1].src} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                    )}
                  </div>
                  <div className="mt-2.5 flex items-start justify-between gap-4 md:mt-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-[1rem] font-semibold tracking-tight md:text-[1.25rem]">{p.client}</h3>
                      <p className="mt-0.5 truncate text-[0.76rem] text-muted md:whitespace-normal md:text-[0.85rem]">
                        <span className="hidden md:inline">{tx(p.title, lang)} · </span>
                        {tx(p.location, lang)}
                      </p>
                    </div>
                    <span className="hidden h-9 shrink-0 items-center rounded-full bg-ink px-4 text-[0.8rem] text-white transition group-hover:bg-ink-2 md:inline-flex">
                      {t("v2.discover")}
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  );
}
