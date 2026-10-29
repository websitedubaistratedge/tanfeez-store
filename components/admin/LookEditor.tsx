"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ImagePlus, Loader2, MousePointerClick, Search, Trash2, X } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, Field, PageHeader, Toggle, aed, inputCls } from "./ui";
import { deleteLook, saveLook, uploadImages } from "@/lib/admin-actions";
import { shrinkImages } from "@/lib/resize-image";
import { ROOM_KINDS } from "@/lib/looks";
import type { Look, LookPin } from "@/lib/types";

export type PickerProduct = { id: string; name: string; image: string; category: string; price: number | null };

/**
 * Room editor: tap the photo to drop a pin, pick the piece it points at, drag pins to adjust.
 * Pin positions are stored as percentages, so they stay put at every screen size.
 */
export function LookEditor({ look: initial, products }: { look: Look; products: PickerProduct[] }) {
  const router = useRouter();
  const [look, setLook] = useState<Look>(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [picker, setPicker] = useState<number | null>(null); // pin index waiting for a product
  const [saving, startSave] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const frame = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ i: number; moved: boolean } | null>(null);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const isNew = !initial.id;

  const set = (patch: Partial<Look>) => {
    setLook((l) => ({ ...l, ...patch }));
    setSaved(false);
  };
  const setPins = (fn: (pins: LookPin[]) => LookPin[]) => set({ pins: fn(look.pins) });

  const pointAt = (e: { clientX: number; clientY: number }) => {
    const r = frame.current!.getBoundingClientRect();
    return {
      x: Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)) * 10) / 10,
      y: Math.round(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) * 10) / 10,
    };
  };

  // Tap empty photo → new pin, then choose its product
  const onFrameClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    if (look.pins.length >= 12) return;
    const { x, y } = pointAt(e);
    const i = look.pins.length;
    setPins((p) => [...p, { productId: "", x, y }]);
    setSelected(i);
    setPicker(i);
  };

  const onPinDown = (e: React.PointerEvent, i: number) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { i, moved: false };
    setSelected(i);
  };
  const onPinMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current.moved = true;
    const { x, y } = pointAt(e);
    const i = drag.current.i;
    setPins((p) => p.map((pin, k) => (k === i ? { ...pin, x, y } : pin)));
  };
  const onPinUp = () => {
    drag.current = null;
  };

  const choose = (productId: string) => {
    if (picker === null) return;
    const i = picker;
    setPins((p) => p.map((pin, k) => (k === i ? { ...pin, productId } : pin)));
    setPicker(null);
  };
  const closePicker = () => {
    // a brand-new pin that never got a product is dropped
    if (picker !== null && !look.pins[picker]?.productId) {
      const i = picker;
      setPins((p) => p.filter((_, k) => k !== i));
      setSelected(null);
    }
    setPicker(null);
  };
  const removePin = (i: number) => {
    setPins((p) => p.filter((_, k) => k !== i));
    setSelected(null);
  };

  const upload = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    startUpload(async () => {
      const fd = new FormData();
      (await shrinkImages([file])).forEach((f) => fd.append("files", f));
      const [url] = await uploadImages(fd);
      if (!url) return setError("That file could not be uploaded. Use a JPG, PNG or WebP photo.");
      setError("");
      set({ image: url }); // the real width/height are read once the photo loads
    });
  };

  const save = () => {
    setError("");
    startSave(async () => {
      const r = await saveLook({ ...look, pins: look.pins.filter((p) => p.productId) });
      if (!r.ok) return setError(r.error);
      setSaved(true);
      if (isNew) router.replace(`/admin/inspiration/${r.id}`);
      else router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/admin/inspiration" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Inspiration
      </Link>
      <PageHeader
        title={isNew ? "New room" : look.title.en || "Room"}
        sub="Tap the photo to pin a piece · drag pins to move them · tap a pin to change it"
        actions={
          <>
            {!isNew && (
              <Btn variant="ghost" onClick={() => confirm(`Delete "${look.title.en}"? This cannot be undone.`) && startSave(async () => { await deleteLook(look.id); router.push("/admin/inspiration"); })}>
                <Trash2 className="h-4 w-4" /> Delete
              </Btn>
            )}
            <Btn variant="dark" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
              {saved ? "Saved" : isNew ? "Create room" : "Save changes"}
            </Btn>
          </>
        }
      />
      {error && <p className="-mt-4 mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Photo + pins */}
        <div className="min-w-0 lg:col-span-8">
          <Card className="!p-3">
            {look.image ? (
              <>
                <div
                  ref={frame}
                  onClick={onFrameClick}
                  className="relative cursor-crosshair touch-none select-none overflow-hidden rounded-xl bg-plate"
                  style={{ aspectRatio: `${look.w}/${look.h}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={look.image}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    onLoad={(e) => {
                      const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                      if (w && h && (w !== look.w || h !== look.h)) setLook((l) => ({ ...l, w, h }));
                    }}
                  />
                  {look.pins.map((pin, i) => {
                    const p = byId.get(pin.productId);
                    const on = selected === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onPointerDown={(e) => onPinDown(e, i)}
                        onPointerMove={onPinMove}
                        onPointerUp={onPinUp}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        aria-label={p?.name ?? "Pin"}
                      >
                        <span className={clsx("flex items-center gap-1.5 rounded-full bg-white py-1 pe-3 ps-1 text-[0.75rem] font-medium shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] transition", on ? "ring-2 ring-ink" : "")}>
                          <span className={clsx("flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem]", on ? "bg-ink text-white" : "bg-plate")}>{i + 1}</span>
                          <span className="max-w-[5.5rem] truncate sm:max-w-[9rem]">{p?.name ?? "Choose a piece…"}</span>
                        </span>
                      </button>
                    );
                  })}
                  {look.pins.length === 0 && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto flex w-max items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[0.85rem] shadow-lg">
                      <MousePointerClick className="h-4 w-4" /> Tap on a piece of furniture to pin it
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between px-1 text-[0.8rem] text-muted">
                  <span>{look.pins.length} of 12 pins · {look.w} × {look.h}px</span>
                  <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 hover:text-ink" disabled={uploading}>
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />} Replace photo
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  upload(e.dataTransfer.files);
                }}
                className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-muted transition hover:border-ink hover:text-ink"
              >
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6 stroke-[1.5]" />}
                <span className="font-medium text-ink">{uploading ? "Uploading…" : "Add the room photo"}</span>
                <span className="text-[0.8rem]">A wide, landscape interior shot works best · JPG, PNG or WebP</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files)} />
          </Card>
        </div>

        {/* Details */}
        <div className="min-w-0 space-y-4 lg:col-span-4">
          <Card className="space-y-3">
            <h2 className="font-display font-semibold tracking-tight">Pieces in this room</h2>
            {look.pins.length === 0 ? (
              <p className="text-[0.85rem] text-muted">Pinned pieces appear here, and as a shoppable list beside the room on the website.</p>
            ) : (
              <ul className="space-y-1">
                {look.pins.map((pin, i) => {
                  const p = byId.get(pin.productId);
                  return (
                    <li key={i} className={clsx("flex items-center gap-3 rounded-xl p-1.5 transition", selected === i ? "bg-plate" : "hover:bg-plate/60")} onClick={() => setSelected(i)}>
                      <span className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem]", selected === i ? "bg-ink text-white" : "bg-plate")}>{i + 1}</span>
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-plate">{p && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.85rem]">{p?.name ?? "No piece chosen"}</span>
                        <span className="block text-[0.75rem] text-muted">{p ? (p.price ? aed(p.price) : "Price on request") : ""}</span>
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); setSelected(i); setPicker(i); }} className="rounded-full px-2 py-1 text-[0.75rem] text-ink/60 hover:bg-white hover:text-ink">Change</button>
                      <button onClick={(e) => { e.stopPropagation(); removePin(i); }} className="rounded-full p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600" aria-label="Remove pin"><X className="h-4 w-4" /></button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display font-semibold tracking-tight">Details</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Title (English)"><input className={inputCls} value={look.title.en} onChange={(e) => set({ title: { ...look.title, en: e.target.value } })} placeholder="e.g. Emerald Hour" /></Field>
              <Field label="Title (Arabic)"><input dir="rtl" className={inputCls} value={look.title.ar} onChange={(e) => set({ title: { ...look.title, ar: e.target.value } })} /></Field>
              <Field label="Mood line (English)"><input className={inputCls} value={look.mood.en} onChange={(e) => set({ mood: { ...look.mood, en: e.target.value } })} placeholder="e.g. Marina penthouse · velvet & skyline" /></Field>
              <Field label="Mood line (Arabic)"><input dir="rtl" className={inputCls} value={look.mood.ar} onChange={(e) => set({ mood: { ...look.mood, ar: e.target.value } })} /></Field>
            </div>
            <Field label="Room type" hint="Used for the lookbook filters">
              <select className={inputCls} value={look.room} onChange={(e) => set({ room: e.target.value as Look["room"] })}>
                {ROOM_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>{k.en}</option>
                ))}
              </select>
            </Field>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display font-semibold tracking-tight">Where it shows</h2>
            <Toggle checked={look.live} onChange={(v) => set({ live: v })} label="Live in the lookbook" />
            <Toggle checked={look.home} onChange={(v) => set({ home: v })} label="Feature in “Shop the look” on the home page" />
            <p className="text-[0.78rem] text-muted">Rooms without any pinned pieces stay hidden on the website.</p>
          </Card>
        </div>
      </div>

      <ProductPicker open={picker !== null} products={products} current={picker !== null ? look.pins[picker]?.productId : ""} onPick={choose} onClose={closePicker} />
    </div>
  );
}

function ProductPicker({ open, products, current, onPick, onClose }: { open: boolean; products: PickerProduct[]; current?: string; onPick: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const list = products.filter((p) => !q || `${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal>
          <motion.div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-2xl bg-white sm:rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line p-4">
              <label className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Which piece is this?" className={clsx(inputCls, "pl-9")} />
              </label>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-plate" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <ul className="overflow-y-auto p-2" data-lenis-prevent>
              {list.map((p) => (
                <li key={p.id}>
                  <button onClick={() => onPick(p.id)} className={clsx("flex w-full items-center gap-3 rounded-xl p-2 text-start transition hover:bg-plate", current === p.id && "bg-plate")}>
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-plate"><Image src={p.image} alt="" fill sizes="48px" className="object-cover" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9rem]">{p.name}</span>
                      <span className="block text-[0.75rem] text-muted">{p.category} · {p.price ? aed(p.price) : "Price on request"}</span>
                    </span>
                    {current === p.id && <Check className="h-4 w-4" />}
                  </button>
                </li>
              ))}
              {list.length === 0 && <li className="p-6 text-center text-sm text-muted">No piece matches “{q}”.</li>}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
