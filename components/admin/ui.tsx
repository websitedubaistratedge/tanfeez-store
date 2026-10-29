"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { OrderStatus, RequestStatus } from "@/lib/types";

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-none tracking-[-0.03em]">{title}</h1>
        {sub && <p className="mt-2 text-[0.9rem] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={clsx("rounded-2xl border border-line bg-white p-5", className)}>
      {children}
    </div>
  );
}

export function Btn({
  variant = "dark",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "dark" | "brand" | "ghost" | "danger" | "outline" }) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[0.88rem] font-medium transition disabled:opacity-50",
        (variant === "dark" || variant === "brand") && "bg-ink text-white hover:bg-ink-2",
        variant === "ghost" && "text-ink/70 hover:bg-plate hover:text-ink",
        variant === "outline" && "border border-line bg-white hover:border-ink",
        variant === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
        className
      )}
    />
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[0.8rem] font-medium text-muted">
        {label}
        {hint && <span className="text-[0.72rem] font-normal text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-ink";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="inline-flex items-center gap-2.5 text-sm" aria-pressed={checked}>
      <span className={clsx("relative h-6 w-11 rounded-full transition", checked ? "bg-ink" : "bg-ink/15")}>
        <motion.span layout className={clsx("absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm", checked ? "end-1" : "start-1")} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </span>
      {label}
    </button>
  );
}

const ORDER_TONE: Record<OrderStatus, string> = {
  new: "bg-brand/25 text-ink",
  confirmed: "bg-sky-50 text-sky-800",
  production: "bg-violet-50 text-violet-800",
  delivery: "bg-amber-50 text-amber-800",
  delivered: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-red-50 text-red-700",
};
export const ORDER_LABEL: Record<OrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  production: "In production",
  delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export function OrderBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.72rem] font-medium", ORDER_TONE[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {ORDER_LABEL[status]}
    </span>
  );
}

export const REQ_LABEL: Record<RequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  visit: "Site visit",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};
export const REQ_TONE: Record<RequestStatus, string> = {
  new: "bg-brand",
  contacted: "bg-sky-400",
  visit: "bg-violet-400",
  quoted: "bg-amber-400",
  won: "bg-emerald-500",
  lost: "bg-red-400",
};

export const SERVICE_LABEL = { fitout: "Fit-out", furniture: "Furniture", technical: "Technical", custom: "Custom piece", samples: "Fabric samples" } as const;

export const aed = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;
export const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const fmtDateTime = (s: string) => new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export function ago(s: string) {
  const d = (Date.now() - new Date(s).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export const PAYMENT_LABEL = { cod: "Pay on delivery", bank: "Bank transfer", tabby: "Tabby · pay in 4", tamara: "Tamara · pay in 3" } as const;

/** An order's payment state; orders saved before payment tracking count as paid once delivered. */
export function paymentOf(o: { paymentStatus?: "unpaid" | "deposit" | "paid"; amountPaid?: number; status: string; total: number }) {
  const status = o.paymentStatus ?? (o.status === "delivered" ? "paid" : "unpaid");
  const paid = status === "paid" ? o.total : status === "unpaid" ? 0 : (o.amountPaid ?? 0);
  return { status, paid, due: Math.max(0, o.total - paid) };
}
export const PAYMENT_STATUS_LABEL = { unpaid: "Unpaid", deposit: "Deposit paid", paid: "Paid" } as const;
const PAYMENT_TONE = { unpaid: "bg-red-50 text-red-700", deposit: "bg-amber-50 text-amber-800", paid: "bg-emerald-50 text-emerald-800" } as const;
export function PaymentBadge({ status }: { status: keyof typeof PAYMENT_TONE }) {
  return <span className={clsx("inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[0.7rem] font-medium", PAYMENT_TONE[status])}>{PAYMENT_STATUS_LABEL[status]}</span>;
}
