import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { activitySince } from "@/lib/db";
import type { Message, Order, QuoteRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export type PulseItem = { key: string; kind: "order" | "quote" | "samples" | "message"; title: string; sub: string; href: string; at: string };

const aed = (n: number) => `AED ${n.toLocaleString("en-US")}`;

// Polled by the admin's LiveAlerts every ~30 s. `v` is the last data version the
// browser saw and `since` the time it started listening.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const now = new Date().toISOString();
  const since = url.searchParams.get("since") || now;
  const v = Number(url.searchParams.get("v") ?? -1);
  const { version, items } = await activitySince(v, since);

  const out: PulseItem[] = items
    .map(({ coll, doc }): PulseItem | null => {
      if (coll === "orders") {
        const o = doc as unknown as Order;
        return { key: `o:${o.id}`, kind: "order", title: `New order ${o.number}`, sub: `${o.customer.name} · ${aed(o.total)}`, href: `/admin/orders/${o.id}`, at: o.createdAt };
      }
      if (coll === "requests") {
        const r = doc as unknown as QuoteRequest;
        const samples = r.service === "samples";
        return { key: `r:${r.id}`, kind: samples ? "samples" : "quote", title: samples ? `Fabric samples ${r.number}` : `Quote request ${r.number}`, sub: [r.contact.name, r.space].filter(Boolean).join(" · "), href: "/admin/requests", at: r.createdAt };
      }
      const m = doc as unknown as Message;
      if (m.name === "Newsletter") return null;
      return { key: `m:${m.id}`, kind: "message", title: "New message", sub: `${m.name} · ${m.subject}`, href: "/admin/messages", at: m.createdAt };
    })
    .filter((x): x is PulseItem => !!x)
    .sort((a, b) => a.at.localeCompare(b.at));

  return NextResponse.json({ version, now, items: out }, { headers: { "cache-control": "no-store" } });
}
