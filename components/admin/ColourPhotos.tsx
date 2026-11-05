"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import clsx from "clsx";
import { uploadImages } from "@/lib/admin-actions";
import { shrinkImages } from "@/lib/resize-image";
import { materialsFor, type MaterialCatalog } from "@/lib/configurator";
import type { Product } from "@/lib/types";

/** One photo per configurator colour, plus which colour the main photo shows. */
export function ColourPhotos({ product: p, materials, onChange }: { product: Product; materials: MaterialCatalog; onChange: (patch: Pick<Product, "photoColour" | "colourImages">) => void }) {
  const mats = materialsFor(p, materials);
  const input = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const photos = p.colourImages ?? {};
  const count = Object.keys(photos).length + (p.photoColour ? 1 : 0);

  const pick = (id: string) => {
    setTarget(id);
    input.current?.click();
  };
  const upload = (files: FileList | null) => {
    const id = target;
    if (!files?.[0] || !id) return;
    start(async () => {
      const fd = new FormData();
      (await shrinkImages([files[0]])).forEach((f) => fd.append("files", f));
      const [url] = await uploadImages(fd);
      if (url) onChange({ photoColour: p.photoColour, colourImages: { ...photos, [id]: url } });
    });
  };
  const remove = (id: string) => {
    const next = { ...photos };
    delete next[id];
    onChange({ photoColour: p.photoColour, colourImages: next });
  };

  if (!mats.length) return null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display font-semibold tracking-tight">Photos by colour</h2>
          <p className="mt-1 text-sm text-muted">Customers can order this piece in the colour the main photo shows (★) and in every colour that has a photo here; picking one switches the photo. All other colours appear as “Not available”. {count > 0 && <b className="font-medium text-ink">{count} available.</b>}</p>
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
      {mats.map((m) => (
        <div key={m.id}>
          <p className="mb-2 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-muted">{m.name.en}</p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-5">
            {m.colours.map((c) => {
              const main = p.photoColour === c.id;
              const src = main ? p.images[0] : photos[c.id];
              return (
                <div key={c.id} className={clsx("group relative overflow-hidden rounded-2xl border bg-white", main ? "border-ink" : "border-line")}>
                  <button type="button" onClick={() => !main && pick(c.id)} className="relative block aspect-square w-full bg-plate" disabled={pending}>
                    {src ? (
                      <Image src={src} alt="" fill sizes="140px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[0.72rem] text-ink/40">
                        {pending && target === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                        Add photo
                      </span>
                    )}
                  </button>
                  <div className="flex items-center gap-2 px-2.5 py-2">
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
                    <span className="min-w-0 flex-1 truncate text-[0.78rem]">{c.name.en}</span>
                    <button
                      type="button"
                      title={main ? "The main photo shows this colour" : "The main photo shows this colour"}
                      onClick={() => onChange({ photoColour: main ? undefined : c.id, colourImages: photos })}
                      className={clsx("rounded-full p-0.5", main ? "text-brand-600" : "text-ink/20 hover:text-ink/60")}
                    >
                      <Star className={clsx("h-3.5 w-3.5", main && "fill-brand")} />
                    </button>
                  </div>
                  {photos[c.id] && !main && (
                    <button type="button" onClick={() => remove(c.id)} className="absolute end-1.5 top-1.5 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100" aria-label="Remove photo">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-[0.76rem] text-faint">The ★ marks the colour your main photo (first image above) shows. Click an empty tile to add a photo of the piece in that colour; click a filled one to replace it.</p>
    </div>
  );
}
