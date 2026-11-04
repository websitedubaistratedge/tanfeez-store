"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, Loader2, Mail, MapPin, Phone, Printer, Trash2, MessageCircle } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, OrderBadge, ORDER_LABEL, PAYMENT_LABEL, PAYMENT_STATUS_LABEL, aed, fmtDateTime, inputCls, paymentOf } from "./ui";
import { adminCapturePayment, adminRefundPayment, adminSyncPayment, adminVoidPayment, deleteOrder, setOrderPayment, setOrderStatus } from "@/lib/admin-actions";
import { Logo } from "@/components/ui/Logo";
import type { Order, OrderStatus, PaymentStatus, Settings } from "@/lib/types";

const FLOW: OrderStatus[] = ["new", "confirmed", "production", "delivery", "delivered"];

export function OrderDetail({ order: o, bank }: { order: Order; bank: Settings["bank"] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const idx = FLOW.indexOf(o.status);
  const phone = o.customer.phone.replace(/[^\d]/g, "");

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/orders" className="no-print mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Orders</Link>
      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3"><h1 className="font-display text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-none tracking-[-0.03em]">{o.number}</h1><OrderBadge status={o.status} /></div>
          <p className="mt-1 text-ink/55">Placed {fmtDateTime(o.createdAt)} · {PAYMENT_LABEL[o.payment]}</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Invoice</Btn>
          <Btn variant="danger" onClick={() => confirm(`Delete order ${o.number}?`) && start(async () => { await deleteOrder(o.id); router.push("/admin/orders"); })}><Trash2 className="h-4 w-4" /></Btn>
        </div>
      </div>

      <Card className="no-print mb-4">
        <p className="mb-4 text-sm font-medium text-ink/60">Move order through production</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {FLOW.map((s, i) => (
            <button
              key={s}
              disabled={pending || o.status === "cancelled"}
              onClick={() => start(() => setOrderStatus(o.id, s))}
              className={clsx("relative flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition disabled:opacity-60", i <= idx ? "border-ink bg-ink text-white" : "border-ink/10 hover:border-ink/40")}
            >
              <span className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs", i <= idx ? "bg-brand text-ink" : "bg-plate")}>{i < idx || (i === idx && s === "delivered") ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
              {ORDER_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          {pending ? <span className="inline-flex items-center gap-2 text-sm text-ink/50"><Loader2 className="h-4 w-4 animate-spin" /> Updating…</span> : <span />}
          {o.status !== "cancelled" ? (
            <button onClick={() => confirm("Cancel this order? Stock will be returned.") && start(() => setOrderStatus(o.id, "cancelled"))} className="text-sm font-medium text-red-600 hover:underline">Cancel order</button>
          ) : (
            <button onClick={() => start(() => setOrderStatus(o.id, "new"))} className="text-sm font-medium text-ink/60 hover:underline">Reopen order</button>
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 print:shadow-none print:ring-0">
          <div className="mb-6 hidden items-start justify-between print:flex">
            <Logo sub />
            <div className="text-right text-sm"><p className="font-display text-xl font-semibold tracking-tight">TAX INVOICE</p><p>{o.number}</p><p>{fmtDateTime(o.createdAt)}</p></div>
          </div>
          <h2 className="mb-4 font-display font-semibold tracking-tight">Items</h2>
          <ul className="divide-y divide-ink/5">
            {o.items.map((it, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-plate print:hidden"><Image src={it.image} alt="" fill sizes="64px" className="object-cover" /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-ink/50">{[it.finish, it.size].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="hidden text-sm text-ink/60 sm:inline">{it.qty} × {aed(it.price)}</span>
                <span className="shrink-0 text-right font-medium tabular-nums sm:w-28">
                  {aed(it.qty * it.price)}
                  {it.qty > 1 && <span className="block text-[0.72rem] font-normal text-muted sm:hidden">{it.qty} × {aed(it.price)}</span>}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd className="font-semibold">{aed(o.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Delivery &amp; installation ({o.customer.emirate})</dt><dd className="font-semibold">{o.delivery ? aed(o.delivery) : "Free"}</dd></div>
            <div className="flex justify-between text-ink/50"><dt>VAT 5% (included)</dt><dd>{aed(o.vat)}</dd></div>
            <div className="flex justify-between border-t border-ink/10 pt-3 text-lg"><dt className="font-medium">Total</dt><dd className="font-semibold">{aed(o.total)}</dd></div>
          </dl>
          {o.payment === "bank" && (
            <div className="mt-6 rounded-xl bg-plate p-4 text-sm">
              <p className="font-medium">Bank transfer details</p>
              <p className="text-ink/70">{bank.account} · {bank.name}<br />IBAN {bank.iban}</p>
            </div>
          )}
          {o.notes && <p className="mt-4 rounded-xl bg-plate p-4 text-sm"><b>Customer note:</b> {o.notes}</p>}
        </Card>

        <div className="space-y-4">
          {o.gateway && <GatewayCard order={o} />}
          <PaymentCard order={o} />
          <Card>
            <h2 className="mb-3 font-display font-semibold tracking-tight">Customer</h2>
            <p className="font-medium">{o.customer.name}</p>
            {o.customerId ? (
              <Link href={`/admin/customers/${o.customerId}`} className="no-print mt-1 inline-flex items-center gap-1.5 rounded-full bg-band px-2.5 py-0.5 text-[0.74rem] font-medium hover:bg-plate">Has an account · view</Link>
            ) : (
              <span className="no-print mt-1 inline-block text-[0.74rem] text-muted">Guest checkout</span>
            )}
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li><a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-ink"><Phone className="h-4 w-4" />{o.customer.phone}</a></li>
              {o.customer.email && <li><a href={`mailto:${o.customer.email}`} className="flex items-center gap-2 hover:text-ink"><Mail className="h-4 w-4" />{o.customer.email}</a></li>}
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{o.customer.address}, {o.customer.area}, {o.customer.emirate}</li>
            </ul>
            <a href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hello ${o.customer.name}, this is TANFEEZ about your order ${o.number}.`)}`} target="_blank" rel="noreferrer" className="no-print mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-medium text-white">
              <MessageCircle className="h-4 w-4" /> WhatsApp customer
            </a>
          </Card>
          <Card className="no-print">
            <h2 className="mb-3 font-display font-semibold tracking-tight">Timeline</h2>
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

/** Payment state: unpaid, a deposit taken (with the amount), or paid in full. */
function PaymentCard({ order: o }: { order: Order }) {
  const pay = paymentOf(o);
  const [pending, start] = useTransition();
  const [deposit, setDeposit] = useState(String(pay.status === "deposit" ? pay.paid : Math.round(o.total / 2)));
  const save = (status: PaymentStatus) => start(() => setOrderPayment(o.id, status, Number(deposit)));
  return (
    <Card className="no-print">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-semibold tracking-tight">Payment</h2>
        <span className="text-[0.78rem] text-muted">{PAYMENT_LABEL[o.payment]}</span>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-full bg-plate p-1">
        {(["unpaid", "deposit", "paid"] as const).map((st) => (
          <button
            key={st}
            onClick={() => save(st)}
            disabled={pending}
            className={clsx("h-9 rounded-full text-[0.8rem] transition", pay.status === st ? "bg-white font-medium text-ink shadow-sm" : "text-ink/55 hover:text-ink")}
          >
            {PAYMENT_STATUS_LABEL[st].replace(" paid", "")}
          </button>
        ))}
      </div>
      {pay.status === "deposit" && (
        <div className="mt-3 flex items-center gap-2">
          <input className={inputCls} inputMode="numeric" value={deposit} onChange={(e) => setDeposit(e.target.value.replace(/[^\d]/g, ""))} aria-label="Deposit received (AED)" />
          <Btn variant="outline" onClick={() => save("deposit")} disabled={pending}>Save</Btn>
        </div>
      )}
      <dl className="mt-4 space-y-1.5 text-[0.88rem]">
        <div className="flex justify-between"><dt className="text-muted">Received</dt><dd className="font-medium tabular-nums">{aed(pay.paid)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Balance due</dt><dd className={clsx("font-medium tabular-nums", pay.due > 0 ? "text-red-700" : "text-emerald-700")}>{pay.due > 0 ? aed(pay.due) : "Settled"}</dd></div>
      </dl>
    </Card>
  );
}

const GATEWAY_NAME = { tabby: "Tabby", tamara: "Tamara", ziina: "Ziina" } as const;
const GATEWAY_STATE = {
  pending: ["Awaiting payment", "bg-amber-50 text-amber-800"],
  authorized: ["Approved · not captured", "bg-sky-50 text-sky-800"],
  paid: ["Paid", "bg-emerald-50 text-emerald-800"],
  failed: ["Failed", "bg-red-50 text-red-700"],
  cancelled: ["Cancelled", "bg-plate text-ink/60"],
  refunded: ["Refunded", "bg-plate text-ink/70"],
} as const;

/** Online payment controls: status, capture, cancel approval, refund. */
function GatewayCard({ order: o }: { order: Order }) {
  const g = o.gateway!;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const left = Math.round((o.total - g.refunded) * 100) / 100;
  const [amount, setAmount] = useState(String(left));
  const [reason, setReason] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const act = (fn: () => Promise<{ ok: boolean; message?: string }>, done: string) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      setMsg(r.ok ? { ok: true, text: done } : { ok: false, text: r.message ?? "Something went wrong." });
      router.refresh();
    });
  const [label, tone] = GATEWAY_STATE[g.state];
  const canCapture = g.state === "authorized" && !g.captured && g.provider !== "ziina";
  const canRefund = g.captured && (g.state === "paid" || g.state === "refunded") && left > 0;

  return (
    <Card className="no-print space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-semibold tracking-tight">Online payment</h2>
        <span className="text-[0.78rem] text-muted">{GATEWAY_NAME[g.provider]}{g.test && " · test"}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={clsx("rounded-full px-2.5 py-1 text-[0.76rem] font-medium", tone)}>{label}</span>
        {g.captured && g.state !== "refunded" && <span className="rounded-full bg-plate px-2.5 py-1 text-[0.76rem] text-ink/70">Captured</span>}
        {g.refunded > 0 && <span className="rounded-full bg-plate px-2.5 py-1 text-[0.76rem] text-ink/70">Refunded {aed(g.refunded)}</span>}
      </div>
      <p className="break-all font-mono text-[0.72rem] text-faint">{g.ref}</p>
      {g.state === "authorized" && !g.captured && <p className="text-[0.8rem] text-muted">Captured automatically when you set the order to <b>Out for delivery</b>.</p>}

      <div className="flex flex-wrap gap-2">
        <Btn variant="outline" className="h-9 px-4 text-[0.82rem]" disabled={pending} onClick={() => act(() => adminSyncPayment(o.id), "Status updated from " + GATEWAY_NAME[g.provider] + ".")}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Check status
        </Btn>
        {canCapture && (
          <Btn variant="dark" className="h-9 px-4 text-[0.82rem]" disabled={pending} onClick={() => confirm(`Capture ${aed(o.total)} now?`) && act(() => adminCapturePayment(o.id), "Payment captured.")}>
            Capture {aed(o.total)}
          </Btn>
        )}
        {g.state === "authorized" && !g.captured && (
          <Btn variant="ghost" className="h-9 px-4 text-[0.82rem]" disabled={pending} onClick={() => confirm("Release this approval? The customer won't be charged and the order is cancelled.") && act(() => adminVoidPayment(o.id), "Approval released; order cancelled.")}>
            Cancel payment
          </Btn>
        )}
        {canRefund && !refundOpen && (
          <Btn variant="ghost" className="h-9 px-4 text-[0.82rem]" onClick={() => setRefundOpen(true)}>Refund…</Btn>
        )}
      </div>

      {canRefund && refundOpen && (
        <div className="space-y-2 rounded-xl bg-plate/70 p-3">
          <div className="flex gap-2">
            <input className={inputCls} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-label="Refund amount (AED)" />
            <Btn
              variant="danger"
              className="shrink-0"
              disabled={pending || !(Number(amount) > 0)}
              onClick={() => confirm(`Refund AED ${amount} to the customer through ${GATEWAY_NAME[g.provider]}? This can't be undone.`) && act(async () => { const r = await adminRefundPayment(o.id, Number(amount), reason); if (r.ok) setRefundOpen(false); return r; }, `Refunded AED ${amount}.`)}
            >
              Refund
            </Btn>
          </div>
          <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional, shared with the provider)" />
          <p className="text-[0.74rem] text-muted">Up to {aed(left)}. Partial refunds are fine.</p>
        </div>
      )}
      {msg && <p className={clsx("text-[0.8rem]", msg.ok ? "text-emerald-700" : "text-red-600")}>{msg.text}</p>}

      <details className="text-[0.78rem] text-muted">
        <summary className="cursor-pointer">Activity</summary>
        <ul className="mt-2 space-y-1">
          {[...g.log].reverse().map((l, i) => (
            <li key={i} className="flex justify-between gap-3"><span>{l.note}</span><span className="shrink-0 text-faint">{fmtDateTime(l.at)}</span></li>
          ))}
        </ul>
      </details>
    </Card>
  );
}
