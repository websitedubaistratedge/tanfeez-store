"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { mutate, readDB, uid } from "./db";
import { saveUpload } from "./uploads";
import type { Lang, Order, QuoteRequest } from "./types";
import { configPrice, describeConfig } from "./configurator";

export async function setLang(lang: Lang) {
  (await cookies()).set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

const clean = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
const digits = (v: string) => v.replace(/\D/g, "");

// ───────── Orders ─────────
export type CheckoutInput = {
  items: { productId: string; qty: number; finish?: string; size?: string; material?: string; colour?: string }[];
  customer: Order["customer"];
  payment: Order["payment"];
  notes?: string;
};

export async function placeOrder(input: CheckoutInput): Promise<{ ok: true; number: string } | { ok: false; error: string }> {
  const c = input.customer;
  if (!clean(c.name) || digits(c.phone).length < 8 || !clean(c.address) || !clean(c.emirate))
    return { ok: false, error: "missing" };
  if (!input.items?.length) return { ok: false, error: "empty" };

  const number = await mutate((db) => {
    const lines = input.items
      .map((it) => {
        const p = db.products.find((x) => x.id === it.productId && x.status === "active");
        if (!p || p.priceOnRequest) return null;
        // Price is always recomputed on the server from the chosen configuration.
        const sizeIndex = it.size ? Math.max(0, p.sizes.indexOf(it.size)) : 0;
        const price = it.material ? configPrice(p, { material: it.material, size: sizeIndex }).total : p.salePrice || p.price;
        const finish = it.material ? describeConfig(p, { material: it.material, colour: it.colour }) : clean(it.finish, 80);
        return {
          productId: p.id,
          slug: p.slug,
          name: p.name.en,
          image: p.images[0],
          price,
          qty: Math.max(1, Math.min(20, Math.floor(it.qty))),
          finish: finish || undefined,
          size: clean(it.size, 80) || undefined,
        };
      })
      .filter(Boolean) as Order["items"];
    if (!lines.length) throw new Error("no valid items");
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const fee = db.settings.deliveryFees[c.emirate] ?? 300;
    const delivery = c.emirate === "Dubai" && subtotal >= db.settings.freeDeliveryOver ? 0 : fee;
    const total = subtotal + delivery;
    const n = `TNF-${db.counters.order++}`;
    const at = new Date().toISOString();
    for (const l of lines) {
      const p = db.products.find((x) => x.id === l.productId)!;
      p.stock = Math.max(0, p.stock - l.qty);
    }
    db.orders.unshift({
      id: uid(),
      number: n,
      customer: {
        name: clean(c.name, 120),
        phone: clean(c.phone, 40),
        email: clean(c.email, 160),
        emirate: clean(c.emirate, 40),
        area: clean(c.area, 120),
        address: clean(c.address, 300),
      },
      items: lines,
      subtotal,
      delivery,
      vat: Math.round((total / 1.05) * 0.05),
      total,
      payment: (["bank", "tabby", "tamara"] as const).find((x) => x === input.payment) ?? "cod",
      notes: clean(input.notes, 1000),
      status: "new",
      history: [{ status: "new", at }],
      createdAt: at,
    });
    return n;
  }).catch(() => null);

  if (!number) return { ok: false, error: "invalid" };
  revalidatePath("/admin", "layout");
  return { ok: true, number };
}

export async function trackOrder(number: string, phone: string) {
  const db = await readDB();
  const o = db.orders.find(
    (x) => x.number.toLowerCase() === clean(number).toLowerCase() && digits(x.customer.phone).endsWith(digits(phone).slice(-7))
  );
  if (!o || digits(phone).length < 7) return null;
  return {
    number: o.number,
    status: o.status,
    history: o.history,
    createdAt: o.createdAt,
    total: o.total,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, image: i.image })),
  };
}

// ───────── Quote requests ─────────
export async function submitQuote(fd: FormData): Promise<{ ok: true; number: string } | { ok: false }> {
  const name = clean(fd.get("name"), 120);
  const phone = clean(fd.get("phone"), 40);
  const email = clean(fd.get("email"), 160);
  if (!name || digits(phone).length < 8) return { ok: false };

  const files: string[] = [];
  for (const f of fd.getAll("files").slice(0, 5)) {
    if (f instanceof File) {
      const url = await saveUpload(f);
      if (url) files.push(url);
    }
  }
  const service = clean(fd.get("service"), 20) as QuoteRequest["service"];
  const number = await mutate((db) => {
    const n = `RQ-${db.counters.request++}`;
    db.requests.unshift({
      id: uid(),
      number: n,
      service: ["fitout", "furniture", "technical", "custom"].includes(service) ? service : "fitout",
      space: clean(fd.get("space"), 80),
      area: clean(fd.get("area"), 20),
      emirate: clean(fd.get("emirate"), 40),
      budget: clean(fd.get("budget"), 40),
      timeline: clean(fd.get("timeline"), 40),
      details: clean(fd.get("details"), 4000),
      product: clean(fd.get("product"), 160) || undefined,
      files,
      contact: { name, company: clean(fd.get("company"), 120), phone, email },
      status: "new",
      notes: [],
      createdAt: new Date().toISOString(),
    });
    return n;
  });
  revalidatePath("/admin", "layout");
  return { ok: true, number };
}

// ───────── Fabric samples ─────────
export async function requestSamples(input: {
  swatches: string[];
  product?: string;
  name: string;
  phone: string;
  email: string;
  emirate: string;
  address: string;
}): Promise<{ ok: true; number: string } | { ok: false }> {
  const name = clean(input.name, 120);
  const phone = clean(input.phone, 40);
  const swatches = (input.swatches || []).slice(0, 4).map((s) => clean(s, 60)).filter(Boolean);
  if (!name || digits(phone).length < 8 || !swatches.length || !clean(input.address)) return { ok: false };
  const number = await mutate((db) => {
    const n = `RQ-${db.counters.request++}`;
    db.requests.unshift({
      id: uid(),
      number: n,
      service: "samples",
      space: "Fabric samples",
      emirate: clean(input.emirate, 40),
      budget: "Free",
      timeline: "2–3 days",
      details: `Samples requested: ${swatches.join(", ")}\nDeliver to: ${clean(input.address, 300)}`,
      product: clean(input.product, 160) || undefined,
      files: [],
      contact: { name, phone, email: clean(input.email, 160) },
      status: "new",
      notes: [],
      createdAt: new Date().toISOString(),
    });
    return n;
  });
  revalidatePath("/admin", "layout");
  return { ok: true, number };
}

// ───────── Contact & newsletter ─────────
export async function sendMessage(fd: FormData): Promise<{ ok: boolean }> {
  const name = clean(fd.get("name"), 120);
  const email = clean(fd.get("email"), 160);
  const message = clean(fd.get("message"), 4000);
  if (!name || !email.includes("@") || !message) return { ok: false };
  await mutate((db) => {
    db.messages.unshift({
      id: uid(),
      name,
      email,
      phone: clean(fd.get("phone"), 40),
      subject: clean(fd.get("subject"), 160) || "Website enquiry",
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function subscribe(email: string): Promise<{ ok: boolean }> {
  const e = clean(email, 160);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return { ok: false };
  await mutate((db) => {
    db.messages.unshift({
      id: uid(),
      name: "Newsletter",
      email: e,
      subject: "Newsletter sign-up",
      message: `${e} subscribed to new collection updates.`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  });
  return { ok: true };
}
