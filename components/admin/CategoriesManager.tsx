"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X, Loader2 } from "lucide-react";
import { Btn, Card, Field, inputCls, PageHeader } from "./ui";
import { ImageUploader } from "./ImageUploader";
import { deleteCategory, moveCategory, saveCategory } from "@/lib/admin-actions";
import type { Category } from "@/lib/types";

const blank: Category = { id: "", slug: "", name: { en: "", ar: "" }, blurb: { en: "", ar: "" }, image: "", order: 0 };

export function CategoriesManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [edit, setEdit] = useState<Category | null>(null);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Categories" sub="Shown as filters in the shop, in this order." actions={<Btn variant="brand" onClick={() => setEdit(blank)}><Plus className="h-4 w-4" /> New category</Btn>} />
      {err && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</p>}
      <Card className="!p-0">
        <ul>
          {categories.map((c, i) => (
            <motion.li layout key={c.id} className="flex items-center gap-4 border-t border-ink/5 p-4 first:border-0">
              <div className="flex flex-col">
                <button disabled={i === 0} onClick={() => start(() => moveCategory(c.id, -1))} className="rounded p-0.5 text-ink/40 hover:text-ink disabled:opacity-20" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button disabled={i === categories.length - 1} onClick={() => start(() => moveCategory(c.id, 1))} className="rounded p-0.5 text-ink/40 hover:text-ink disabled:opacity-20" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
              </div>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">{c.image && <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{c.name.en} <span className="font-[family-name:var(--font-tajawal)] font-medium text-ink/50" dir="rtl">· {c.name.ar}</span></p>
                <p className="truncate text-sm text-ink/50">{c.blurb.en}</p>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold">{counts[c.slug] ?? 0} products</span>
              <button onClick={() => setEdit(c)} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
              <button
                onClick={() =>
                  confirm(`Delete "${c.name.en}"?`) &&
                  start(async () => {
                    const r = await deleteCategory(c.id);
                    setErr(r.ok ? "" : r.error ?? "");
                  })
                }
                className="rounded-lg p-2 text-ink/50 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.li>
          ))}
        </ul>
      </Card>

      <AnimatePresence>
        {edit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEdit(null)} />
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <button onClick={() => setEdit(null)} className="absolute right-4 top-4 rounded-full p-2 hover:bg-ink/5" aria-label="Close"><X className="h-4 w-4" /></button>
              <h2 className="mb-5 text-xl font-black">{edit.id ? "Edit category" : "New category"}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name (EN)"><input className={inputCls} value={edit.name.en} onChange={(e) => setEdit({ ...edit, name: { ...edit.name, en: e.target.value } })} /></Field>
                  <Field label="Name (AR)"><input dir="rtl" className={inputCls} value={edit.name.ar} onChange={(e) => setEdit({ ...edit, name: { ...edit.name, ar: e.target.value } })} /></Field>
                </div>
                <Field label="Short description (EN)"><input className={inputCls} value={edit.blurb.en} onChange={(e) => setEdit({ ...edit, blurb: { ...edit.blurb, en: e.target.value } })} /></Field>
                <Field label="Short description (AR)"><input dir="rtl" className={inputCls} value={edit.blurb.ar} onChange={(e) => setEdit({ ...edit, blurb: { ...edit.blurb, ar: e.target.value } })} /></Field>
                <Field label="URL slug" hint="auto from name"><input className={inputCls} value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></Field>
                <div>
                  <p className="mb-1.5 text-sm font-bold text-ink/80">Image</p>
                  <ImageUploader value={edit.image ? [edit.image] : []} onChange={(v) => setEdit({ ...edit, image: v[v.length - 1] ?? "" })} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn>
                <Btn
                  variant="brand"
                  disabled={pending || !edit.name.en}
                  onClick={() =>
                    start(async () => {
                      await saveCategory(edit);
                      setEdit(null);
                    })
                  }
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save
                </Btn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
