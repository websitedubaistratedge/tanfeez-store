"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import clsx from "clsx";
import { Card, PageHeader, inputCls, OrderBadge, ORDER_LABEL, PAYMENT_LABEL, aed, fmtDate, Btn } from "./ui";
import type { Order, OrderStatus } from "@/lib/types";

const TABS: (OrderStatus | "all")[] = ["all", "new", "confirmed", "production", "delivery", "delivered", "cancelled"];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      orders.filter(
        (o) =>
          (tab === "all" || o.status === tab) &&
          (!q || `${o.number} ${o.customer.name} ${o.customer.phone} ${o.customer.email}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [orders, tab, q]
  );

  const exportCsv = () => {
    const rows = [["Order", "Date", "Customer", "Phone", "Emirate", "Items", "Total", "Payment", "Status"]].concat(
      list.map((o) => [o.number, o.createdAt.slice(0, 10), o.customer.name, o.customer.phone, o.customer.emirate, o.items.map((i) => `${i.qty}x ${i.name}`).join("; "), String(o.total), o.payment, o.status])
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `tanfeez-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Orders" sub={`${orders.length} orders · ${aed(orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0))} lifetime`} actions={<Btn variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Btn>} />
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((s) => (
          <button key={s} onClick={() => setTab(s)} className={clsx("shrink-0 rounded-full px-4 py-2 text-sm font-bold", tab === s ? "bg-ink text-white" : "bg-white text-ink/60 hover:text-ink")}>
            {s === "all" ? "All" : ORDER_LABEL[s]} <span className="opacity-50">{s === "all" ? orders.length : orders.filter((o) => o.status === s).length}</span>
          </button>
        ))}
      </div>
      <Card className="!p-0">
        <div className="border-b border-ink/5 p-4">
          <label className="relative block max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order #, name, phone…" className={clsx(inputCls, "pl-9")} />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-ink/45">
                <th className="px-4 py-3">Order</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Items</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Status</th><th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-t border-ink/5 hover:bg-sand/50">
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-bold hover:underline">{o.number}</Link></td>
                  <td className="px-3 py-3 text-ink/60">{fmtDate(o.createdAt)}</td>
                  <td className="px-3 py-3"><span className="font-semibold">{o.customer.name}</span><span className="block text-xs text-ink/45">{o.customer.emirate} · {o.customer.phone}</span></td>
                  <td className="px-3 py-3 text-ink/70">{o.items.reduce((s, i) => s + i.qty, 0)} item(s)</td>
                  <td className="px-3 py-3 text-ink/70">{PAYMENT_LABEL[o.payment]}</td>
                  <td className="px-3 py-3"><OrderBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-right font-bold">{aed(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-10 text-center text-ink/50">No orders here.</p>}
        </div>
      </Card>
    </div>
  );
}
