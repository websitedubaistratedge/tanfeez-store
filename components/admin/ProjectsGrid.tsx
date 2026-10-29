"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Plus, Star, Trash2, Images } from "lucide-react";
import clsx from "clsx";
import { PageHeader } from "./ui";
import { deleteProject, patchProject } from "@/lib/admin-actions";
import type { Project } from "@/lib/types";

const SECTORS = ["all", "retail", "fnb", "office", "hospitality", "residential", "automotive", "accommodation"] as const;

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [, start] = useTransition();
  const [sector, setSector] = useState<(typeof SECTORS)[number]>("all");
  const list = sector === "all" ? projects : projects.filter((p) => p.sector === sector);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Projects"
        sub={`${projects.length} case studies · ${projects.filter((p) => p.featured).length} featured on the home page`}
        actions={<Link href="/admin/projects/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[0.88rem] font-medium text-white transition hover:bg-ink-2"><Plus className="h-4 w-4" /> New project</Link>}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {SECTORS.map((s) => (
          <button key={s} onClick={() => setSector(s)} className={clsx("rounded-full px-4 py-2 text-sm font-medium capitalize", sector === s ? "bg-ink text-white" : "bg-white text-ink/60 ring-1 ring-line hover:text-ink")}>
            {s === "fnb" ? "F&B" : s}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => (
          <div key={p.id} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <Link href={`/admin/projects/${p.id}`} className="relative block aspect-[4/3] bg-plate">
              {p.images[0] && <Image src={p.images[0].src} alt="" fill sizes="300px" className="object-cover transition duration-500 group-hover:scale-105" />}
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white"><Images className="h-3 w-3" /> {p.images.length}</span>
            </Link>
            <div className="flex items-start gap-2 p-4">
              <Link href={`/admin/projects/${p.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.client}</p>
                <p className="truncate text-xs text-ink/50">{p.title.en} · {p.location.en}</p>
              </Link>
              <button onClick={() => start(() => patchProject(p.id, { featured: !p.featured }))} aria-label="Toggle featured" title="Featured on home page">
                <Star className={clsx("h-5 w-5", p.featured ? "fill-brand text-brand-600" : "text-ink/20 hover:text-ink/50")} />
              </button>
              <button onClick={() => confirm(`Delete "${p.client}"?`) && start(() => deleteProject(p.id))} className="text-ink/30 hover:text-red-600" aria-label="Delete">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
