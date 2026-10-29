"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, Field, inputCls, PageHeader, Toggle } from "./ui";
import { ImageUploader } from "./ImageUploader";
import { deleteProduct, saveProduct } from "@/lib/admin-actions";
import type { Category, Product } from "@/lib/types";

export function ProductForm({ product, categories }: { product: Product; categories: Category[] }) {
  const router = useRouter();
  const [p, setP] = useState<Product>(product);
  const [sizes, setSizes] = useState(product.sizes.join(", "));
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const isNew = !product.id;
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((s) => ({ ...s, [k]: v }));

  const save = () => {
    setErr("");
    if (!p.name.en.trim()) return setErr("English name is required.");
    if (!p.images.length) return setErr("Add at least one image.");
    start(async () => {
      const { id } = await saveProduct({ ...p, sizes: sizes.split(",") });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      if (isNew) router.replace(`/admin/products/${id}`);
      else router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink/50 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <PageHeader
        title={isNew ? "New product" : p.name.en || "Edit product"}
        sub={isNew ? "Add a piece to the online store" : `${p.sku} · /shop/${p.slug}`}
        actions={
          <>
            {!isNew && (
              <a href={`/shop/${p.slug}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 text-sm font-bold">
                <ExternalLink className="h-4 w-4" /> View
              </a>
            )}
            <Btn variant="brand" onClick={save} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
              {saved ? "Saved" : isNew ? "Create product" : "Save changes"}
            </Btn>
          </>
        }
      />
      {err && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-extrabold">Images</h2>
            <ImageUploader value={p.images} onChange={(v) => set("images", v)} />
          </Card>

          <Card className="space-y-4">
            <h2 className="font-extrabold">Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name (English)"><input className={inputCls} value={p.name.en} onChange={(e) => set("name", { ...p.name, en: e.target.value })} /></Field>
              <Field label="Name (Arabic)"><input dir="rtl" className={inputCls} value={p.name.ar} onChange={(e) => set("name", { ...p.name, ar: e.target.value })} /></Field>
              <Field label="Description (English)" className="sm:col-span-2"><textarea rows={4} className={inputCls} value={p.description.en} onChange={(e) => set("description", { ...p.description, en: e.target.value })} /></Field>
              <Field label="Description (Arabic)" className="sm:col-span-2"><textarea dir="rtl" rows={4} className={inputCls} value={p.description.ar} onChange={(e) => set("description", { ...p.description, ar: e.target.value })} /></Field>
              <Field label="Materials (English)"><input className={inputCls} value={p.materials.en} onChange={(e) => set("materials", { ...p.materials, en: e.target.value })} /></Field>
              <Field label="Materials (Arabic)"><input dir="rtl" className={inputCls} value={p.materials.ar} onChange={(e) => set("materials", { ...p.materials, ar: e.target.value })} /></Field>
              <Field label="Dimensions"><input className={inputCls} value={p.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="230 × 95 × 78 cm" /></Field>
              <Field label="Sizes" hint="comma separated"><input className={inputCls} value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="Queen 160, King 180" /></Field>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-extrabold">Finishes &amp; colours</h2>
              <Btn variant="outline" type="button" onClick={() => set("finishes", [...p.finishes, { name: { en: "", ar: "" }, hex: "#C49A6C" }])}>
                <Plus className="h-4 w-4" /> Add finish
              </Btn>
            </div>
            {p.finishes.length === 0 && <p className="text-sm text-ink/45">No finishes yet.</p>}
            <ul className="space-y-2">
              {p.finishes.map((f, i) => {
                const upd = (nf: typeof f) => set("finishes", p.finishes.map((x, j) => (j === i ? nf : x)));
                return (
                  <li key={i} className="flex items-center gap-2">
                    <input type="color" value={f.hex} onChange={(e) => upd({ ...f, hex: e.target.value })} className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-ink/10 bg-white p-1" aria-label="Colour" />
                    <input className={inputCls} placeholder="Name (EN)" value={f.name.en} onChange={(e) => upd({ ...f, name: { ...f.name, en: e.target.value } })} />
                    <input dir="rtl" className={inputCls} placeholder="الاسم" value={f.name.ar} onChange={(e) => upd({ ...f, name: { ...f.name, ar: e.target.value } })} />
                    <button type="button" onClick={() => set("finishes", p.finishes.filter((_, j) => j !== i))} className="rounded-lg p-2 text-ink/40 hover:bg-red-50 hover:text-red-600" aria-label="Remove finish">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4">
            <h2 className="font-extrabold">Visibility</h2>
            <Toggle checked={p.status === "active"} onChange={(v) => set("status", v ? "active" : "draft")} label={p.status === "active" ? "Live on store" : "Draft (hidden)"} />
            <Toggle checked={p.featured} onChange={(v) => set("featured", v)} label="Featured on home page" />
            <Toggle checked={p.isNew} onChange={(v) => set("isNew", v)} label="Show “New” badge" />
          </Card>

          <Card className="space-y-4">
            <h2 className="font-extrabold">Pricing &amp; stock</h2>
            <Toggle checked={!!p.priceOnRequest} onChange={(v) => set("priceOnRequest", v)} label="Made to order (price on request)" />
            <div className={clsx("grid grid-cols-2 gap-3", p.priceOnRequest && "pointer-events-none opacity-40")}>
              <Field label="Price (AED)"><input type="number" min={0} className={inputCls} value={p.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
              <Field label="Sale price"><input type="number" min={0} className={inputCls} value={p.salePrice ?? ""} onChange={(e) => set("salePrice", e.target.value ? Number(e.target.value) : null)} placeholder="—" /></Field>
              <Field label="Stock"><input type="number" min={0} className={inputCls} value={p.stock} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
              <Field label="Lead time (days)"><input type="number" min={0} className={inputCls} value={p.leadTimeDays} onChange={(e) => set("leadTimeDays", Number(e.target.value))} /></Field>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-extrabold">Organisation</h2>
            <Field label="Category">
              <select className={inputCls} value={p.category} onChange={(e) => set("category", e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name.en}</option>
                ))}
              </select>
            </Field>
            <Field label="SKU" hint="auto if empty"><input className={inputCls} value={p.sku} onChange={(e) => set("sku", e.target.value)} /></Field>
            <Field label="URL slug" hint="auto from name"><input className={inputCls} value={p.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
          </Card>

          {!isNew && (
            <Btn
              variant="danger"
              className="w-full"
              onClick={() =>
                confirm(`Delete "${p.name.en}"? This cannot be undone.`) &&
                start(async () => {
                  await deleteProduct(p.id);
                  router.push("/admin/products");
                })
              }
            >
              <Trash2 className="h-4 w-4" /> Delete product
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
