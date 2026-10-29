"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Star, Trash2 } from "lucide-react";
import clsx from "clsx";
import { PageHeader, Toggle } from "./ui";
import { deleteLook, moveLook, patchLook } from "@/lib/admin-actions";
import { ROOM_KINDS } from "@/lib/looks";
import type { Look, RoomKind } from "@/lib/types";

export function LooksGrid({ looks, names }: { looks: Look[]; names: Record<string, string> }) {
  const [, start] = useTransition();
  const [kind, setKind] = useState<RoomKind | "all">("all");
  const list = kind === "all" ? looks : looks.filter((l) => l.room === kind);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Inspiration"
        sub={`${looks.length} rooms · ${looks.filter((l) => l.home).length} on the home page · order here is the order on the website`}
        actions={
          <>
            <a href="/inspiration" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-5 text-[0.88rem] font-medium transition hover:border-ink">
              <ExternalLink className="h-4 w-4" /> View lookbook
            </a>
            <Link href="/admin/inspiration/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[0.88rem] font-medium text-white transition hover:bg-ink-2">
              <Plus className="h-4 w-4" /> New room
            </Link>
          </>
        }
      />

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {[{ id: "all" as const, en: "All rooms" }, ...ROOM_KINDS].map((k) => (
          <button key={k.id} onClick={() => setKind(k.id)} className={clsx("shrink-0 rounded-full px-4 py-2 text-sm font-medium", kind === k.id ? "bg-ink text-white" : "bg-white text-ink/60 ring-1 ring-line hover:text-ink")}>
            {k.en} <span className="opacity-50">{k.id === "all" ? looks.length : looks.filter((l) => l.room === k.id).length}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((l) => {
          const i = looks.indexOf(l);
          return (
            <article key={l.id} className={clsx("overflow-hidden rounded-2xl border border-line bg-white transition", !l.live && "opacity-60")}>
              <Link href={`/admin/inspiration/${l.id}`} className="group relative block bg-plate" style={{ aspectRatio: `${l.w}/${l.h}` }}>
                <Image src={l.image} alt="" fill sizes="(min-width:1280px) 30vw, (min-width:640px) 45vw, 90vw" className="object-cover" />
                {l.pins.map((p, k) => (
                  <span key={k} className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[0.62rem] font-medium shadow-md" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    {k + 1}
                  </span>
                ))}
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-ink/30 group-hover:opacity-100">
                  <Pencil className="me-2 h-4 w-4" /> Edit room
                </span>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-[1.05rem] font-semibold tracking-tight">{l.title.en}</p>
                    <p className="truncate text-[0.8rem] text-muted">{l.mood.en}</p>
                  </div>
                  <button onClick={() => start(() => patchLook(l.id, { home: !l.home }))} className="p-1" aria-label="Show on home page" title={l.home ? "On the home page" : "Show on the home page"}>
                    <Star className={clsx("h-5 w-5", l.home ? "fill-brand text-brand-600" : "text-ink/20 hover:text-ink/50")} />
                  </button>
                </div>
                <p className="mt-2 line-clamp-1 text-[0.78rem] text-ink/60">
                  {l.pins.length ? l.pins.map((p) => names[p.productId] ?? "Removed product").join(" · ") : "No pieces pinned yet"}
                </p>
                <div className="mt-3 flex items-center gap-1 border-t border-line pt-3">
                  <Toggle checked={l.live} onChange={(v) => start(() => patchLook(l.id, { live: v }))} label={l.live ? "Live" : "Hidden"} />
                  <span className="ms-auto flex items-center">
                    <span className="me-1 rounded-full bg-plate px-2 py-0.5 text-[0.7rem] text-ink/60">{ROOM_KINDS.find((k) => k.id === l.room)?.en}</span>
                    {kind === "all" && (
                      <>
                        <button onClick={() => start(() => moveLook(l.id, -1))} disabled={i === 0} className="rounded-full p-1.5 text-ink/50 hover:bg-plate hover:text-ink disabled:opacity-25" aria-label="Move earlier"><ArrowUp className="h-4 w-4" /></button>
                        <button onClick={() => start(() => moveLook(l.id, 1))} disabled={i === looks.length - 1} className="rounded-full p-1.5 text-ink/50 hover:bg-plate hover:text-ink disabled:opacity-25" aria-label="Move later"><ArrowDown className="h-4 w-4" /></button>
                      </>
                    )}
                    <button onClick={() => confirm(`Delete "${l.title.en}"? This cannot be undone.`) && start(() => deleteLook(l.id))} className="rounded-full p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {list.length === 0 && <p className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">No rooms here yet.</p>}
    </div>
  );
}
