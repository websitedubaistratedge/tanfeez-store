import { readDB } from "@/lib/db";
import { Dashboard } from "@/components/admin/Dashboard";

export default async function AdminHome() {
  const db = await readDB();
  const now = Date.now();
  const day = 864e5;
  const valid = db.orders.filter((o) => o.status !== "cancelled");
  const inRange = (o: { createdAt: string }, from: number, to: number) => {
    const t = new Date(o.createdAt).getTime();
    return t >= now - from * day && t < now - to * day;
  };
  const cur = valid.filter((o) => inRange(o, 30, 0));
  const prev = valid.filter((o) => inRange(o, 60, 30));
  const sum = (a: typeof valid) => a.reduce((s, o) => s + o.total, 0);

  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * day);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = valid.filter((o) => o.createdAt.slice(0, 10) === key);
    return { date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: sum(dayOrders), orders: dayOrders.length };
  });

  const statuses = ["new", "confirmed", "production", "delivery", "delivered", "cancelled"] as const;
  const byStatus = statuses.map((s) => ({ status: s, count: db.orders.filter((o) => o.status === s).length }));

  const sales = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
  for (const o of cur)
    for (const it of o.items) {
      const r = sales.get(it.productId) ?? { name: it.name, image: it.image, qty: 0, revenue: 0 };
      r.qty += it.qty;
      r.revenue += it.qty * it.price;
      sales.set(it.productId, r);
    }

  const openReqs = db.requests.filter((r) => !["won", "lost"].includes(r.status));

  return (
    <Dashboard
      kpis={{
        revenue: sum(cur),
        revenuePrev: sum(prev),
        orders: cur.length,
        ordersPrev: prev.length,
        aov: cur.length ? sum(cur) / cur.length : 0,
        aovPrev: prev.length ? sum(prev) / prev.length : 0,
        openRequests: openReqs.length,
        pipeline: openReqs.reduce((s, r) => s + (r.value ?? 0), 0),
      }}
      series={series}
      byStatus={byStatus}
      latestOrders={db.orders.slice(0, 6)}
      latestRequests={db.requests.slice(0, 5)}
      top={[...sales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5)}
      lowStock={db.products.filter((p) => !p.priceOnRequest && p.status === "active" && p.stock <= 2).map((p) => ({ id: p.id, name: p.name.en, stock: p.stock, image: p.images[0] }))}
    />
  );
}
