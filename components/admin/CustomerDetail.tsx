"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, Copy, KeyRound, Loader2, LogOut, Mail, Phone, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, Field, OrderBadge, PageHeader, Toggle, aed, ago, fmtDate, inputCls } from "./ui";
import { Avatar } from "./CustomersTable";
import { adminDeleteCustomer, adminResetCustomerPassword, adminSaveCustomer, adminSignOutCustomer } from "@/lib/admin-actions";
import { EMIRATES } from "@/lib/i18n";
import type { Customer, Order } from "@/lib/types";

const wa = (phone: string) => {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = `971${d.slice(1)}`;
  return d;
};

export function CustomerDetail({ customer, orders }: { customer: Customer; orders: Order[] }) {
  const router = useRouter();
  const [c, setC] = useState(customer);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [temp, setTemp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const set = <K extends keyof Customer>(k: K, v: Customer[K]) => setC((x) => ({ ...x, [k]: v }));
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  const save = () =>
    start(async () => {
      setError("");
      const r = await adminSaveCustomer(c.id, c);
      if (!r.ok) return setError(r.error ?? "Couldn't save.");
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      router.refresh();
    });
  const reset = () =>
    confirm(`Give ${c.firstName} a new temporary password? Their current password stops working and they're signed out everywhere.`) &&
    start(async () => {
      setTemp(await adminResetCustomerPassword(c.id));
      setCopied(false);
    });
  const signOutAll = () =>
    start(async () => {
      await adminSignOutCustomer(c.id);
      setNote(`${c.firstName} has been signed out on every device.`);
    });
  const remove = () =>
    confirm(`Delete ${c.firstName} ${c.lastName}'s account? Their orders are kept, but they can no longer sign in to see them. This can't be undone.`) &&
    start(async () => {
      await adminDeleteCustomer(c.id);
      router.replace("/admin/customers");
    });

  const message = temp
    ? `Hello ${c.firstName}, here is your temporary TANFEEZ password: ${temp}\nSign in with ${c.email}, then change it under My account → Password.`
    : "";

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/customers" className="mb-5 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Customers
      </Link>
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        sub={`${customer.kind === "company" ? `${customer.company || "Company"} · ` : ""}Joined ${fmtDate(customer.createdAt)}${customer.lastLogin ? ` · last signed in ${ago(customer.lastLogin)}` : ""}`}
        actions={
          <Btn variant="dark" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved && <Check className="h-4 w-4" />}
            {saved ? "Saved" : "Save changes"}
          </Btn>
        }
      />
      {error && <p className="-mt-4 mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar c={c} big />
              <div className="flex flex-wrap gap-2">
                {c.phone && (
                  <a href={`https://wa.me/${wa(c.phone)}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[0.82rem] font-medium hover:border-ink">
                    <Phone className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
                <a href={`mailto:${c.email}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[0.82rem] font-medium hover:border-ink">
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              </div>
            </div>
            <div className="flex gap-2">
              {(["private", "company"] as const).map((k) => (
                <button key={k} onClick={() => set("kind", k)} className={clsx("rounded-full px-4 py-2 text-sm font-medium", c.kind === k ? "bg-ink text-white" : "bg-white text-ink/60 ring-1 ring-line hover:text-ink")}>
                  {k === "private" ? "Private" : "Company"}
                </button>
              ))}
            </div>
            {c.kind === "company" && <Field label="Company"><input className={inputCls} value={c.company ?? ""} onChange={(e) => set("company", e.target.value)} /></Field>}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name"><input className={inputCls} value={c.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
              <Field label="Last name"><input className={inputCls} value={c.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
              <Field label="Email" hint="used to sign in"><input type="email" className={inputCls} value={c.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Mobile"><input className={inputCls} value={c.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display font-semibold tracking-tight">Delivery address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Emirate">
                <select className={inputCls} value={c.emirate} onChange={(e) => set("emirate", e.target.value)}>
                  {EMIRATES.map((e) => <option key={e}>{e}</option>)}
                </select>
              </Field>
              <Field label="Area"><input className={inputCls} value={c.area} onChange={(e) => set("area", e.target.value)} /></Field>
              <Field label="Address" className="sm:col-span-2"><input className={inputCls} value={c.address} onChange={(e) => set("address", e.target.value)} /></Field>
            </div>
            <Toggle checked={c.marketing} onChange={(v) => set("marketing", v)} label="Happy to receive news and offers" />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-plate p-3.5"><p className="text-[0.75rem] text-muted">Orders</p><p className="mt-1 font-display text-2xl font-semibold">{orders.length}</p></div>
              <div className="rounded-xl bg-plate p-3.5"><p className="text-[0.75rem] text-muted">Spent</p><p className="mt-1 font-display text-2xl font-semibold">{aed(spent)}</p></div>
            </div>
            <ul className="mt-4 divide-y divide-line/70">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:opacity-70">
                    <span>
                      <span className="font-medium">{o.number}</span>
                      <span className="block text-xs text-muted">{fmtDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} item(s)</span>
                    </span>
                    <span className="flex items-center gap-3"><OrderBadge status={o.status} /><span className="font-medium tabular-nums">{aed(o.total)}</span></span>
                  </Link>
                </li>
              ))}
              {!orders.length && <li className="py-4 text-center text-sm text-muted">No orders placed from this account yet.</li>}
            </ul>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display font-semibold tracking-tight">Sign-in &amp; security</h2>
            <p className="text-sm text-muted">Forgot their password? Create a temporary one and send it to them. Passwords are stored encrypted; nobody, including you, can see the old one.</p>
            {temp && (
              <div className="rounded-xl border border-brand/60 bg-brand-50 p-3.5">
                <p className="text-[0.75rem] font-medium text-ink/60">Temporary password (shown once)</p>
                <p className="mt-1 select-all font-mono text-[1.05rem] font-semibold">{temp}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Btn variant="outline" className="h-9 px-4 text-[0.82rem]" onClick={() => navigator.clipboard.writeText(message).then(() => setCopied(true))}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy message"}
                  </Btn>
                  {c.phone && (
                    <a href={`https://wa.me/${wa(c.phone)}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[0.82rem] font-medium text-white">
                      Send on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
            {note && <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">{note}</p>}
            <div className="flex flex-wrap gap-2">
              <Btn variant="outline" onClick={reset} disabled={pending}><KeyRound className="h-4 w-4" /> New temporary password</Btn>
              <Btn variant="ghost" onClick={signOutAll} disabled={pending}><LogOut className="h-4 w-4" /> Sign out everywhere</Btn>
            </div>
          </Card>

          <Card className="space-y-3 !border-red-100">
            <h2 className="font-display font-semibold tracking-tight">Delete account</h2>
            <p className="text-sm text-muted">Removes the login and saved details. Orders stay in Orders.</p>
            <Btn variant="danger" onClick={remove} disabled={pending}><Trash2 className="h-4 w-4" /> Delete account</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}
