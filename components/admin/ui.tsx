"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { OrderStatus, RequestStatus } from "@/lib/types";

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-ink/55">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={clsx("rounded-[20px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-ink/5", className)}>
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:opacity-50",
        variant === "dark" && "bg-ink text-white hover:bg-ink-700",
        variant === "brand" && "bg-brand text-ink hover:bg-brand-600",
        variant === "ghost" && "text-ink/70 hover:bg-ink/5 hover:text-ink",
        variant === "outline" && "border border-ink/15 bg-white hover:border-ink/40",
        variant === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
        className
      )}
    />
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-bold text-ink/80">
        {label}
        {hint && <span className="text-xs font-medium text-ink/40">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ink focus:ring-4 focus:ring-brand/30";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="inline-flex items-center gap-2.5 text-sm font-semibold" aria-pressed={checked}>
      <span className={clsx("relative h-6 w-11 rounded-full transition", checked ? "bg-ink" : "bg-ink/15")}>
        <motion.span layout className={clsx("absolute top-1 h-4 w-4 rounded-full", checked ? "end-1 bg-brand" : "start-1 bg-white")} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </span>
      {label}
    </button>
  );
}

const ORDER_TONE: Record<OrderStatus, string> = {
  new: "bg-brand text-ink",
  confirmed: "bg-sky-100 text-sky-800",
  production: "bg-violet-100 text-violet-800",
  delivery: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
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
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", ORDER_TONE[status])}>{ORDER_LABEL[status]}</span>;
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
