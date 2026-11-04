"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, Download, Mail, Search, UserRound } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, PageHeader, aed, ago, fmtDate, inputCls } from "./ui";
import type { Customer } from "@/lib/types";

type Filter = "all" | "private" | "company" | "marketing" | "buyers";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "buyers", label: "Have ordered" },
  { id: "private", label: "Private" },
  { id: "company", label: "Company" },
  { id: "marketing", label: "Marketing opt-in" },
];

export function CustomersTable({ customers, stats }: { customers: Customer[]; stats: Record<string, { orders: number; spent: number }> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const st = (c: Customer) => stats[c.id] ?? { orders: 0, spent: 0 };
  const match = (c: Customer, f: Filter) =>
    f === "all" || (f === "buyers" ? st(c).orders > 0 : f === "marketing" ? c.marketing : c.kind === f);
  const list = useMemo(
    () =>
      customers.filter(
        (c) => match(c, filter) && (!q || `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.company ?? ""}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [customers, filter, q]
  );

  const exportCsv = () => {
    const rows = [["First name", "Last name", "Email", "Phone", "Type", "Company", "Emirate", "Area", "Address", "Marketing", "Orders", "Spent (AED)", "Joined", "Last sign-in"]].concat(
      list.map((c) => [c.firstName, c.lastName, c.email, c.phone, c.kind, c.company ?? "", c.emirate, c.area, c.address, c.marketing ? "yes" : "no", String(st(c).orders), String(st(c).spent), c.createdAt.slice(0, 10), c.lastLogin?.slice(0, 10) ?? ""])
    );
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `tanfeez-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const week = customers.filter((c) => Date.now() - Date.parse(c.createdAt) < 7 * 864e5).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Customers"
        sub={`${customers.length} accounts · ${week} new this week · ${customers.filter((c) => c.marketing).length} opted in to marketing`}
        actions={<Btn variant="outline" onClick={exportCsv} disabled={!list.length}><Download className="h-4 w-4" /> Export CSV</Btn>}
      />
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={clsx("shrink-0 rounded-full px-4 py-2 text-sm font-medium", filter === f.id ? "bg-ink text-white" : "bg-white text-ink/60 ring-1 ring-line hover:text-ink")}>
            {f.label} <span className="opacity-50">{customers.filter((c) => match(c, f.id)).length}</span>
          </button>
        ))}
      </div>
      <Card className="!p-0">
        <div className="border-b border-line/70 p-3 md:p-4">
          <label className="relative block max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone, company…" className={clsx(inputCls, "pl-9")} />
          </label>
        </div>

        {/* Phones */}
        <ul className="divide-y divide-line/70 md:hidden">
          {list.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-plate/70">
                <Avatar c={c} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.firstName} {c.lastName}</p>
                  <p className="truncate text-[0.8rem] text-muted">{c.email}</p>
                </div>
                <div className="shrink-0 text-right text-[0.8rem]">
                  <p className="font-medium tabular-nums">{st(c).orders ? aed(st(c).spent) : "—"}</p>
                  <p className="text-muted">{st(c).orders} order{st(c).orders === 1 ? "" : "s"}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-left text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-3">Customer</th><th className="px-3 py-3">Phone</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Joined</th><th className="px-3 py-3">Last sign-in</th><th className="px-3 py-3 text-right">Orders</th><th className="px-4 py-3 text-right">Spent</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t border-line/70 hover:bg-plate/70">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3">
                      <Avatar c={c} />
                      <span className="min-w-0">
                        <span className="block font-medium hover:underline">{c.firstName} {c.lastName}</span>
                        <span className="flex items-center gap-1.5 text-xs text-ink/45">{c.email}{c.marketing && <Mail className="h-3 w-3" aria-label="Marketing opt-in" />}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-ink/70">{c.phone || "—"}</td>
                  <td className="px-3 py-3 text-ink/70">
                    <span className="inline-flex items-center gap-1.5">{c.kind === "company" ? <><Building2 className="h-3.5 w-3.5" /> {c.company || "Company"}</> : <><UserRound className="h-3.5 w-3.5" /> Private</>}</span>
                  </td>
                  <td className="px-3 py-3 text-ink/60">{fmtDate(c.createdAt)}</td>
                  <td className="px-3 py-3 text-ink/60">{c.lastLogin ? ago(c.lastLogin) : "—"}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{st(c).orders}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{st(c).orders ? aed(st(c).spent) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <p className="p-10 text-center text-ink/50">
            {customers.length ? "No customers match." : "No accounts yet. Customers can create one from the person icon at the top of the website."}
          </p>
        )}
      </Card>
    </div>
  );
}

export function Avatar({ c, big = false }: { c: Pick<Customer, "firstName" | "lastName">; big?: boolean }) {
  return (
    <span className={clsx("flex shrink-0 items-center justify-center rounded-full bg-band font-semibold text-ink", big ? "h-14 w-14 text-lg" : "h-9 w-9 text-[0.78rem]")}>
      {(c.firstName.charAt(0) + c.lastName.charAt(0)).toUpperCase()}
    </span>
  );
}
