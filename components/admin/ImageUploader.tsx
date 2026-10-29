"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { motion, Reorder } from "framer-motion";
import { ImagePlus, Loader2, X, GripVertical } from "lucide-react";
import clsx from "clsx";
import { uploadImages } from "@/lib/admin-actions";

/** Drag-and-drop uploader with reorderable thumbnails. The first image is the cover. */
export function ImageUploader({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [pending, start] = useTransition();

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    start(async () => {
      const urls = await uploadImages(fd);
      onChange([...value, ...urls]);
    });
  };

  return (
    <div>
      <Reorder.Group axis="x" values={value} onReorder={onChange} className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <Reorder.Item key={src} value={src} className="group relative h-28 w-28 cursor-grab overflow-hidden rounded-2xl bg-sand ring-1 ring-ink/10 active:cursor-grabbing">
            <Image src={src} alt="" fill sizes="112px" className="pointer-events-none object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-black">COVER</span>}
            <GripVertical className="absolute bottom-1.5 left-1.5 h-4 w-4 text-white opacity-0 drop-shadow group-hover:opacity-100" />
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== src))}
              className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Reorder.Item>
        ))}
        <motion.button
          type="button"
          layout
          onClick={() => ref.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            upload(e.dataTransfer.files);
          }}
          className={clsx("flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-xs font-bold text-ink/50 transition", drag ? "border-ink bg-brand-50" : "border-ink/15 hover:border-ink/40")}
        >
          {pending ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          {pending ? "Uploading" : "Add images"}
        </motion.button>
      </Reorder.Group>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
      <p className="mt-2 text-xs text-ink/45">Drag to reorder. The first image is used as the cover. JPG, PNG or WebP, max 15MB.</p>
    </div>
  );
}
