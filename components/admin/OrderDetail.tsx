"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowLeft, Check, Loader2, Mail, MapPin, Phone, Printer, Trash2, MessageCircle } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, OrderBadge, ORDER_LABEL, PAYMENT_LABEL, aed, fmtDateTime } from "./ui";
import { deleteOrder, setOrderStatus } from "@/lib/admin-actions";
import { Logo } from "@/components/ui/Logo";
import type { Order, OrderStatus, Settings } from "@/lib/types";

const FLOW: OrderStatus[] = ["new", "confirmed", "production", "delivery", "delivered"];

export function OrderDetail({ order: o, bank }: { order: Order; bank: Settings["bank"] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const idx = FLOW.indexOf(o.status);
  const phone = o.customer.phone.replace(/[^\d]/g, "");

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/orders" className="no-print mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink/50 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Orders</Link>
      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3"><h1 className="text-3xl font-black tracking-tight">{o.number}</h1><OrderBadge status={o.status} /></div>
          <p className="mt-1 text-ink/55">Placed {fmtDateTime(o.createdAt)} · {PAYMENT_LABEL[o.payment]}</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Invoice</Btn>
          <Btn variant="danger" onClick={() => confirm(`Delete order ${o.number}?`) && start(async () => { await deleteOrder(o.id); router.push("/admin/orders"); })}><Trash2 className="h-4 w-4" /></Btn>
        </div>
      </div>

      <Card className="no-print mb-4">
        <p className="mb-4 text-sm font-bold text-ink/60">Move order through production</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {FLOW.map((s, i) => (
            <button
              key={s}
              disabled={pending || o.status === "cancelled"}
              onClick={() => start(() => setOrderStatus(o.id, s))}
              className={clsx("relative flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-bold transition disabled:opacity-60", i <= idx ? "border-ink bg-ink text-white" : "border-ink/10 hover:border-ink/40")}
            >
              <span className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs", i <= idx ? "bg-brand text-ink" : "bg-sand")}>{i < idx || (i === idx && s === "delivered") ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
              {ORDER_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          {pending ? <span className="inline-flex items-center gap-2 text-sm text-ink/50"><Loader2 className="h-4 w-4 animate-spin" /> Updating…</span> : <span />}
          {o.status !== "cancelled" ? (
            <button onClick={() => confirm("Cancel this order? Stock will be returned.") && start(() => setOrderStatus(o.id, "cancelled"))} className="text-sm font-bold text-red-600 hover:underline">Cancel order</button>
          ) : (
            <button onClick={() => start(() => setOrderStatus(o.id, "new"))} className="text-sm font-bold text-ink/60 hover:underline">Reopen order</button>
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 print:shadow-none print:ring-0">
          <div className="mb-6 hidden items-start justify-between print:flex">
            <Logo sub />
            <div className="text-right text-sm"><p className="text-xl font-black">TAX INVOICE</p><p>{o.number}</p><p>{fmtDateTime(o.createdAt)}</p></div>
          </div>
          <h2 className="mb-4 font-extrabold">Items</h2>
          <ul className="divide-y divide-ink/5">
            {o.items.map((it, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand print:hidden"><Image src={it.image} alt="" fill sizes="64px" className="object-cover" /></div>
                <div className="flex-1">
                  <p className="font-bold">{it.name}</p>
                  <p className="text-xs text-ink/50">{[it.finish, it.size].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="text-sm text-ink/60">{it.qty} × {aed(it.price)}</span>
                <span className="w-28 text-right font-bold">{aed(it.qty * it.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd className="font-semibold">{aed(o.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Delivery &amp; installation ({o.customer.emirate})</dt><dd className="font-semibold">{o.delivery ? aed(o.delivery) : "Free"}</dd></div>
            <div className="flex justify-between text-ink/50"><dt>VAT 5% (included)</dt><dd>{aed(o.vat)}</dd></div>
            <div className="flex justify-between border-t border-ink/10 pt-3 text-lg"><dt className="font-bold">Total</dt><dd className="font-black">{aed(o.total)}</dd></div>
          </dl>
          {o.payment === "bank" && (
            <div className="mt-6 rounded-xl bg-sand p-4 text-sm">
              <p className="font-bold">Bank transfer details</p>
              <p className="text-ink/70">{bank.account} · {bank.name}<br />IBAN {bank.iban}</p>
            </div>
          )}
          {o.notes && <p className="mt-4 rounded-xl bg-brand-50 p-4 text-sm"><b>Customer note:</b> {o.notes}</p>}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-extrabold">Customer</h2>
            <p className="font-bold">{o.customer.name}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li><a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-ink"><Phone className="h-4 w-4" />{o.customer.phone}</a></li>
              {o.customer.email && <li><a href={`mailto:${o.customer.email}`} className="flex items-center gap-2 hover:text-ink"><Mail className="h-4 w-4" />{o.customer.email}</a></li>}
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{o.customer.address}, {o.customer.area}, {o.customer.emirate}</li>
            </ul>
            <a href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hello ${o.customer.name}, this is TANFEEZ about your order ${o.number}.`)}`} target="_blank" rel="noreferrer" className="no-print mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold text-white">
              <MessageCircle className="h-4 w-4" /> WhatsApp customer
            </a>
          </Card>
          <Card className="no-print">
            <h2 className="mb-3 font-extrabold">Timeline</h2>
            <ol className="space-y-3">
              {[...o.history].reverse().map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className={clsx("h-2.5 w-2.5 rounded-full", i === 0 ? "bg-brand" : "bg-ink/20")} />
                  <span className="flex-1 font-semibold">{ORDER_LABEL[h.status]}</span>
                  <span className="text-xs text-ink/45">{fmtDateTime(h.at)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
