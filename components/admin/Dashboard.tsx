"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { ArrowDownRight, ArrowUpRight, ClipboardList, Coins, ShoppingCart, Receipt, AlertTriangle, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Card, OrderBadge, ORDER_LABEL, REQ_LABEL, REQ_TONE, SERVICE_LABEL, aed, ago } from "./ui";
import type { Order, OrderStatus, QuoteRequest } from "@/lib/types";

type Props = {
  kpis: { revenue: number; revenuePrev: number; orders: number; ordersPrev: number; aov: number; aovPrev: number; openRequests: number; pipeline: number };
  series: { date: string; revenue: number; orders: number }[];
  byStatus: { status: OrderStatus; count: number }[];
  latestOrders: Order[];
  latestRequests: QuoteRequest[];
  top: { name: string; image: string; qty: number; revenue: number }[];
  lowStock: { id: string; name: string; stock: number; image: string }[];
};

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev) return null;
  const d = ((cur - prev) / prev) * 100;
  const up = d >= 0;
  return (
    <span className={clsx("inline-flex items-center gap-0.5 text-xs font-medium", up ? "text-emerald-700" : "text-red-600")}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(d).toFixed(0)}% <span className="font-medium text-ink/40">vs prior 30d</span>
    </span>
  );
}

const ChartTip = ({ active, payload, label, money }: { active?: boolean; payload?: { value: number }[]; label?: string; money?: boolean }) =>
  active && payload?.length ? (
    <div className="rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-xl">
      <p className="text-white/60">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{money ? aed(payload[0].value) : payload[0].value}</p>
    </div>
  ) : null;

export function Dashboard({ kpis, series, byStatus, latestOrders, latestRequests, top, lowStock }: Props) {
  const tiles = [
    { label: "Revenue · 30 days", value: aed(kpis.revenue), Icon: Coins, delta: <Delta cur={kpis.revenue} prev={kpis.revenuePrev} />, dark: true },
    { label: "Orders · 30 days", value: kpis.orders, Icon: ShoppingCart, delta: <Delta cur={kpis.orders} prev={kpis.ordersPrev} /> },
    { label: "Average order", value: aed(kpis.aov), Icon: Receipt, delta: <Delta cur={kpis.aov} prev={kpis.aovPrev} /> },
    { label: "Open quote requests", value: kpis.openRequests, Icon: ClipboardList, delta: <span className="text-xs font-semibold text-ink/50">{aed(kpis.pipeline)} quoted pipeline</span> },
  ];
  const hello = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-serif text-[1.2rem] leading-none text-ink-2">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="font-display text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-none tracking-[-0.03em]">{hello}, TANFEEZ</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[0.88rem] font-medium text-white transition hover:bg-ink-2">+ New product</Link>
          <Link href="/admin/projects/new" className="inline-flex h-10 items-center rounded-full border border-line bg-white px-5 text-[0.88rem] font-medium transition hover:border-ink">+ New project</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, i) => (
          <motion.div key={t.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5 }}>
            <Card className={clsx("relative h-full overflow-hidden", t.dark && "!border-transparent !bg-band")}>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[0.82rem] text-muted">
                  {t.dark && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
                  {t.label}
                </p>
                <t.Icon className="h-[18px] w-[18px] stroke-[1.6] text-ink/30" />
              </div>
              <p className="mt-3 font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">{t.value}</p>
              <div className="mt-2.5">{t.delta}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-[1.05rem] font-semibold tracking-tight">Revenue, last 30 days</h2>
            <span className="text-xs font-semibold text-ink/45">AED, VAT incl. · excludes cancelled</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFCB06" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#FFCB06" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#231F20" strokeOpacity={0.06} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8a8586" }} interval={4} />
                <YAxis tickLine={false} axisLine={false} width={44} tick={{ fontSize: 11, fill: "#8a8586" }} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                <Tooltip content={<ChartTip money />} cursor={{ stroke: "#231F20", strokeOpacity: 0.2 }} />
                <Area type="monotone" dataKey="revenue" stroke="#C99A00" strokeWidth={2} fill="url(#rev)" activeDot={{ r: 5, fill: "#231F20", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-[1.05rem] font-semibold tracking-tight">Orders by status</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus.map((s) => ({ ...s, label: ORDER_LABEL[s.status] }))} layout="vertical" margin={{ left: 0, right: 24 }}>
                <XAxis type="number" dataKey="count" domain={[0, "dataMax"]} allowDecimals={false} hide />
                <YAxis type="category" dataKey="label" width={108} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#3a3836", fontWeight: 400 }} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#231F20", fillOpacity: 0.04 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18} label={{ position: "right", fontSize: 12, fill: "#1a1a1a", fontWeight: 500 }}>
                  {byStatus.map((s) => (
                    <Cell key={s.status} fill={s.status === "new" ? "#FFCB06" : "#1a1a1a"} fillOpacity={s.status === "cancelled" ? 0.3 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 !p-0">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-display text-[1.05rem] font-semibold tracking-tight">Latest orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-ink/50 hover:text-ink">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {latestOrders.map((o) => (
                  <tr key={o.id} className="border-t border-line/70 hover:bg-plate/70">
                    <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.number}</Link></td>
                    <td className="px-3 py-3">{o.customer.name}<span className="block text-xs text-ink/45">{o.customer.emirate}</span></td>
                    <td className="px-3 py-3"><OrderBadge status={o.status} /></td>
                    <td className="px-3 py-3 text-ink/50">{ago(o.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-medium">{aed(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="!p-0">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-display text-[1.05rem] font-semibold tracking-tight">Newest requests</h2>
            <Link href="/admin/requests" className="text-sm font-medium text-ink/50 hover:text-ink">Board</Link>
          </div>
          <ul>
            {latestRequests.map((r) => (
              <li key={r.id} className="border-t border-line/70">
                <Link href={`/admin/requests?open=${r.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-plate/70">
                  <span className={clsx("h-2.5 w-2.5 shrink-0 rounded-full", REQ_TONE[r.status])} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.contact.company || r.contact.name}</span>
                    <span className="block truncate text-xs text-ink/50">{SERVICE_LABEL[r.service]} · {r.space} · {REQ_LABEL[r.status]}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink/30" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display font-semibold tracking-tight">Top sellers · 30 days</h2>
          <ul className="space-y-3">
            {top.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="w-4 text-xs font-semibold text-ink/30">{i + 1}</span>
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-plate"><Image src={p.image} alt="" fill sizes="40px" className="object-cover" /></div>
                <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                <span className="text-xs text-ink/50">{p.qty} sold</span>
                <span className="w-28 text-right text-sm font-medium">{aed(p.revenue)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-display font-semibold tracking-tight"><AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-ink/50">All stocked up.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 rounded-xl hover:bg-plate/70">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-plate"><Image src={p.image} alt="" fill sizes="40px" className="object-cover" /></div>
                    <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className={clsx("rounded-full px-2.5 py-1 text-xs font-medium", p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800")}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
