"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, Trash2, X } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, Field, PageHeader, aed, inputCls } from "./ui";
import { saveMaterials } from "@/lib/admin-actions";
import { fabricStyle } from "@/components/shop/Configurator";
import type { Material, MaterialCatalog, Swatch } from "@/lib/types";

type Family = keyof MaterialCatalog;
const FAMILIES: { id: Family; label: string; sub: string; example: { name: string; price: number } }[] = [
  { id: "upholstery", label: "Upholstery", sub: "Sofas, armchairs and beds", example: { name: "a AED 13,000 sofa", price: 13000 } },
  { id: "wood", label: "Wood & lacquer", sub: "Media walls, storage, tables and joinery", example: { name: "a AED 10,000 media wall", price: 10000 } },
];

const blankColour = (): Swatch => ({ id: "", name: { en: "", ar: "" }, hex: "#c8b9a6" });
const blankMaterial = (): Material => ({ id: "", name: { en: "", ar: "" }, note: { en: "", ar: "" }, delta: 0, colours: [blankColour()] });

/** The fabrics, leathers, woods and lacquers customers choose from in the product configurator. */
export function FabricsEditor({ catalog }: { catalog: MaterialCatalog }) {
  const [cat, setCat] = useState<MaterialCatalog>(catalog);
  const [family, setFamily] = useState<Family>("upholstery");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const fam = FAMILIES.find((f) => f.id === family)!;
  const list = cat[family];

  const update = (fn: (l: Material[]) => Material[]) => {
    setCat((c) => ({ ...c, [family]: fn(c[family]) }));
    setDirty(true);
    setSaved(false);
  };
  const patch = (i: number, p: Partial<Material>) => update((l) => l.map((m, k) => (k === i ? { ...m, ...p } : m)));
  const move = (i: number, d: -1 | 1) =>
    update((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const save = () =>
    start(async () => {
      await saveMaterials(cat);
      setDirty(false);
      setSaved(true);
    });

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <PageHeader
        title="Fabrics & finishes"
        sub="What customers choose from on every product page. Upcharges are added to the product's price."
        actions={
          <Btn variant="dark" onClick={save} disabled={pending || !dirty}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {saved && !dirty ? "Saved" : "Save changes"}
          </Btn>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-white p-1 ring-1 ring-line sm:inline-grid">
        {FAMILIES.map((f) => (
          <button key={f.id} onClick={() => setFamily(f.id)} className={clsx("relative rounded-full px-5 py-2 text-[0.88rem] transition", family === f.id ? "text-white" : "text-ink/60 hover:text-ink")}>
            {family === f.id && <motion.span layoutId="fabric-family" className="absolute inset-0 -z-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{f.label} <span className="opacity-60">{cat[f.id].length}</span></span>
          </button>
        ))}
      </div>
      <p className="-mt-3 mb-5 text-[0.85rem] text-muted">{fam.sub}</p>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {list.map((m, i) => (
            <motion.div key={`${family}-${m.id || i}`} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <MaterialCard
                material={m}
                wood={family === "wood"}
                example={fam.example}
                first={i === 0}
                last={i === list.length - 1}
                onChange={(p) => patch(i, p)}
                onMove={(d) => move(i, d)}
                onRemove={() => confirm(`Remove "${m.name.en || "this material"}"? Customers will no longer be able to choose it.`) && update((l) => l.filter((_, k) => k !== i))}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={() => update((l) => [...l, blankMaterial()])} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-5 text-[0.9rem] text-muted transition hover:border-ink hover:text-ink">
          <Plus className="h-4 w-4" /> Add a {family === "wood" ? "wood or finish" : "fabric or leather"}
        </button>
      </div>

      {/* Sticky reminder while there are unsaved edits */}
      <AnimatePresence>
        {dirty && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:left-64">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
              <p className="text-[0.88rem] text-muted">You have unsaved changes.</p>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => { setCat(catalog); setDirty(false); }}>Discard</Btn>
                <Btn variant="dark" onClick={save} disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes</Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MaterialCard({
  material: m,
  wood,
  example,
  first,
  last,
  onChange,
  onMove,
  onRemove,
}: {
  material: Material;
  wood: boolean;
  example: { name: string; price: number };
  first: boolean;
  last: boolean;
  onChange: (p: Partial<Material>) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const pctValue = Math.round(m.delta * 1000) / 10;
  const extra = Math.round((example.price * m.delta) / 50) * 50;
  const setColour = (k: number, p: Partial<Swatch>) => onChange({ colours: m.colours.map((c, j) => (j === k ? { ...c, ...p } : c)) });

  return (
    <Card>
      <div className="flex items-start gap-4">
        <span className="hidden h-14 w-14 shrink-0 rounded-full ring-1 ring-black/10 sm:block" style={fabricStyle(m.colours[0]?.hex ?? "#ddd", wood)} />
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <Field label="Name (English)"><input className={inputCls} value={m.name.en} onChange={(e) => onChange({ name: { ...m.name, en: e.target.value } })} placeholder={wood ? "e.g. Smoked oak" : "e.g. Performance velvet"} /></Field>
          <Field label="Name (Arabic)"><input dir="rtl" className={inputCls} value={m.name.ar} onChange={(e) => onChange({ name: { ...m.name, ar: e.target.value } })} /></Field>
          <Field label="Short note (English)"><input className={inputCls} value={m.note.en} onChange={(e) => onChange({ note: { ...m.note, en: e.target.value } })} placeholder="e.g. Deep colour, stain-resistant pile" /></Field>
          <Field label="Short note (Arabic)"><input dir="rtl" className={inputCls} value={m.note.ar} onChange={(e) => onChange({ note: { ...m.note, ar: e.target.value } })} /></Field>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button onClick={() => onMove(-1)} disabled={first} className="rounded-full p-1.5 text-ink/50 hover:bg-plate hover:text-ink disabled:opacity-25" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
          <button onClick={() => onMove(1)} disabled={last} className="rounded-full p-1.5 text-ink/50 hover:bg-plate hover:text-ink disabled:opacity-25" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
          <button onClick={onRemove} className="rounded-full p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-line pt-4">
        <Field label="Upcharge" className="w-32">
          <div className="relative">
            <input className={clsx(inputCls, "pe-8")} inputMode="decimal" value={pctValue} onChange={(e) => onChange({ delta: Math.max(0, Number(e.target.value.replace(/[^\d.]/g, "")) || 0) / 100 })} />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
          </div>
        </Field>
        <p className="pb-2.5 text-[0.82rem] text-muted">{m.delta > 0 ? <>Adds <span className="font-medium text-ink">{aed(extra)}</span> to {example.name}</> : "Included in the product price"}</p>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[0.8rem] font-medium text-muted">Colours</p>
        <div className="flex flex-wrap items-center gap-2">
          {m.colours.map((c, k) => (
            <button key={k} onClick={() => setOpen(open === k ? null : k)} className={clsx("flex items-center gap-2 rounded-full border py-1 pe-3 ps-1 text-[0.8rem] transition", open === k ? "border-ink" : "border-line hover:border-ink/40")}>
              <span className="h-7 w-7 rounded-full ring-1 ring-black/10" style={fabricStyle(c.hex, wood)} />
              {c.name.en || "New colour"}
            </button>
          ))}
          <button onClick={() => { onChange({ colours: [...m.colours, blankColour()] }); setOpen(m.colours.length); }} className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[0.8rem] text-muted hover:bg-plate hover:text-ink">
            <Plus className="h-3.5 w-3.5" /> Colour
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open !== null && m.colours[open] && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl bg-plate/70 p-3">
                <label className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-black/10" title="Pick a colour" style={fabricStyle(m.colours[open].hex, wood)}>
                  <input type="color" value={m.colours[open].hex} onChange={(e) => setColour(open, { hex: e.target.value })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
                <Field label="Hex" className="w-28"><input className={inputCls} value={m.colours[open].hex} onChange={(e) => setColour(open, { hex: e.target.value.trim() })} /></Field>
                <Field label="Name (English)" className="min-w-[140px] flex-1"><input className={inputCls} value={m.colours[open].name.en} onChange={(e) => setColour(open, { name: { ...m.colours[open].name, en: e.target.value } })} placeholder="e.g. Emerald" /></Field>
                <Field label="Name (Arabic)" className="min-w-[140px] flex-1"><input dir="rtl" className={inputCls} value={m.colours[open].name.ar} onChange={(e) => setColour(open, { name: { ...m.colours[open].name, ar: e.target.value } })} /></Field>
                <div className="flex gap-1 pb-1">
                  <Btn variant="ghost" onClick={() => { onChange({ colours: m.colours.filter((_, j) => j !== open) }); setOpen(null); }}><Trash2 className="h-4 w-4" /></Btn>
                  <Btn variant="outline" onClick={() => setOpen(null)}><X className="h-4 w-4" /> Done</Btn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
