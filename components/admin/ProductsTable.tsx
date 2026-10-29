"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Plus, Search, Star, Trash2, Pencil, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { PageHeader, Card, inputCls, aed, Toggle } from "./ui";
import { deleteProduct, patchProduct } from "@/lib/admin-actions";
import type { Category, Product } from "@/lib/types";

const LOW_STOCK = 2;
const isLow = (p: Product) => !p.priceOnRequest && p.status === "active" && p.stock <= LOW_STOCK;

export function ProductsTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [, start] = useTransition();
  const catName = (s: string) => categories.find((c) => c.slug === s)?.name.en ?? s;

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "all" || (cat === "low" ? isLow(p) : p.category === cat)) &&
          (!q || `${p.name.en} ${p.sku} ${p.name.ar}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [products, q, cat]
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Products"
        sub={`${products.length} products · ${products.filter((p) => p.status === "active").length} live${products.some(isLow) ? ` · ${products.filter(isLow).length} low on stock` : ""}`}
        actions={
          <Link href="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[0.88rem] font-medium text-white transition hover:bg-ink-2">
            <Plus className="h-4 w-4" /> New product
          </Link>
        }
      />
      <Card className="!p-0">
        <div className="flex flex-wrap gap-2 border-b border-line/70 p-3 md:gap-3 md:p-4">
          <label className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU…" className={clsx(inputCls, "pl-9")} />
          </label>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={clsx(inputCls, "w-auto")}>
            <option value="all">All categories</option>
            {products.some(isLow) && <option value="low">Low on stock ({products.filter(isLow).length})</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name.en}</option>
            ))}
          </select>
        </div>
        {/* Phones: one card per product, with the quick controls */}
        <ul className="divide-y divide-line/70 md:hidden">
          {list.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-3 py-3">
              <Link href={`/admin/products/${p.id}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-plate">
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />}
              </Link>
              <Link href={`/admin/products/${p.id}`} className="min-w-0 flex-1">
                <p className="truncate text-[0.9rem] font-medium">{p.name.en}</p>
                <p className="text-[0.8rem] tabular-nums text-ink/70">
                  {p.priceOnRequest ? "On request" : aed(p.salePrice || p.price)}
                  {!p.priceOnRequest && (
                    <span className={clsx("ms-2 text-[0.75rem]", p.stock === 0 ? "text-red-700" : isLow(p) ? "text-amber-700" : "text-muted")}>
                      · {p.stock} in stock
                    </span>
                  )}
                </p>
              </Link>
              <button onClick={() => start(() => patchProduct(p.id, { featured: !p.featured }))} className="p-1.5" aria-label="Toggle featured">
                <Star className={clsx("h-[18px] w-[18px]", p.featured ? "fill-brand text-brand-600" : "text-ink/20")} />
              </button>
              <Toggle checked={p.status === "active"} onChange={(v) => start(() => patchProduct(p.id, { status: v ? "active" : "draft" }))} />
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="text-left text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-3">Product</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Featured</th>
                <th className="px-3 py-3">Live</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-line/70 hover:bg-plate/70">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-plate">
                        {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium">{p.name.en}</p>
                        <p className="text-xs text-ink/45">{p.sku}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-ink/70">{catName(p.category)}</td>
                  <td className="px-3 py-3 font-medium tabular-nums">
                    {p.priceOnRequest ? <span className="text-ink/50">On request</span> : p.salePrice ? <>{aed(p.salePrice)} <span className="text-xs text-ink/40 line-through">{aed(p.price)}</span></> : aed(p.price)}
                  </td>
                  <td className="px-3 py-3">
                    {p.priceOnRequest ? (
                      <span className="text-ink/40">—</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        defaultValue={p.stock}
                        onBlur={(e) => Number(e.target.value) !== p.stock && start(() => patchProduct(p.id, { stock: Math.max(0, Number(e.target.value)) }))}
                        className={clsx("w-20 rounded-lg border px-2 py-1.5 font-medium", p.stock === 0 ? "border-red-200 bg-red-50 text-red-700" : p.stock <= 2 ? "border-amber-200 bg-amber-50" : "border-line")}
                      />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => start(() => patchProduct(p.id, { featured: !p.featured }))} aria-label="Toggle featured">
                      <Star className={clsx("h-5 w-5 transition", p.featured ? "fill-brand text-brand-600" : "text-ink/20 hover:text-ink/50")} />
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <Toggle checked={p.status === "active"} onChange={(v) => start(() => patchProduct(p.id, { status: v ? "active" : "draft" }))} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <a href={`/shop/${p.slug}`} target="_blank" className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink" aria-label="View"><ExternalLink className="h-4 w-4" /></a>
                      <Link href={`/admin/products/${p.id}`} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                      <button
                        onClick={() => confirm(`Delete "${p.name.en}"? This cannot be undone.`) && start(() => deleteProduct(p.id))}
                        className="rounded-lg p-2 text-ink/50 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-10 text-center text-ink/50">No products match.</p>}
        </div>
      </Card>
    </div>
  );
}
