"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, createSession, destroySession, isAdmin } from "./auth";
import { DEMO_ID, mutate, resetDB, uid } from "./db";
import { saveUpload, uploadStore } from "./uploads";
import { EMPTY_NOTIFY, sendTest, telegramChat, type Channel } from "./notify";
import type { Category, L10n, Look, MaterialCatalog, NotifyConfig, OrderStatus, PaymentStatus, Product, Project, RequestStatus, Settings } from "./types";

async function guard() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
const refresh = () => revalidatePath("/", "layout");

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || uid();

// ───────── Auth ─────────
// After MAX_TRIES wrong passwords from one connection, sign-in pauses for LOCK_SECONDS.
// Counters live in Workers KV and expire on their own.
const MAX_TRIES = 5;
const LOCK_SECONDS = 15 * 60;

export async function login(_: unknown, fd: FormData) {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const kv = await uploadStore();
  const key = `login-fails:${ip}`;
  const fails = Number((await kv?.get(key)) ?? 0);
  if (fails >= MAX_TRIES) return { error: "Too many attempts. Please try again in 15 minutes." };

  const pw = String(fd.get("password") || "");
  if (!checkPassword(pw)) {
    await kv?.put(key, String(fails + 1), { expirationTtl: LOCK_SECONDS });
    await new Promise((r) => setTimeout(r, 600));
    const left = MAX_TRIES - fails - 1;
    return { error: left > 0 ? `Incorrect password. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many attempts. Please try again in 15 minutes." };
  }
  await kv?.delete(key);
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

// ───────── Uploads ─────────
export async function uploadImages(fd: FormData): Promise<string[]> {
  await guard();
  const out: string[] = [];
  for (const f of fd.getAll("files").slice(0, 12)) {
    if (f instanceof File) {
      const url = await saveUpload(f, 15);
      if (url) out.push(url);
    }
  }
  return out;
}

// ───────── Products ─────────
export async function saveProduct(input: Product): Promise<{ id: string }> {
  await guard();
  const id = await mutate((db) => {
    const slugBase = slugify(input.slug || input.name.en);
    const taken = (s: string) => db.products.some((p) => p.slug === s && p.id !== input.id);
    let slug = slugBase;
    for (let i = 2; taken(slug); i++) slug = `${slugBase}-${i}`;
    const data: Product = {
      ...input,
      slug,
      price: Math.max(0, Number(input.price) || 0),
      salePrice: input.salePrice ? Number(input.salePrice) : null,
      stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
      leadTimeDays: Math.max(0, Math.floor(Number(input.leadTimeDays) || 0)),
      sizes: input.sizes.map((s) => s.trim()).filter(Boolean),
    };
    const i = db.products.findIndex((p) => p.id === input.id);
    if (i >= 0) {
      db.products[i] = data;
      return data.id;
    }
    const n = db.products.length + 1001;
    const created = { ...data, id: `prd_${uid()}`, sku: data.sku || `TNF-${n}`, createdAt: new Date().toISOString(), rating: 5, reviews: 0 };
    db.products.unshift(created);
    return created.id;
  });
  refresh();
  return { id };
}

export async function deleteProduct(id: string) {
  await guard();
  await mutate((db) => {
    db.products = db.products.filter((p) => p.id !== id);
  });
  refresh();
}

export async function patchProduct(id: string, patch: Partial<Pick<Product, "featured" | "status" | "stock" | "isNew">>) {
  await guard();
  await mutate((db) => {
    const p = db.products.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
  });
  refresh();
}

// ───────── Categories ─────────
export async function saveCategory(input: Category) {
  await guard();
  await mutate((db) => {
    const slug = slugify(input.slug || input.name.en);
    const i = db.categories.findIndex((c) => c.id === input.id);
    if (i >= 0) {
      const old = db.categories[i].slug;
      db.categories[i] = { ...input, slug };
      if (old !== slug) db.products.forEach((p) => p.category === old && (p.category = slug));
    } else db.categories.push({ ...input, slug, id: `cat_${uid()}`, order: db.categories.length });
  });
  refresh();
}

export async function deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  await guard();
  const res = await mutate((db) => {
    const c = db.categories.find((x) => x.id === id);
    if (!c) return { ok: false, error: "Not found" };
    const used = db.products.filter((p) => p.category === c.slug).length;
    if (used) return { ok: false, error: `${used} products use this category. Move them first.` };
    db.categories = db.categories.filter((x) => x.id !== id);
    return { ok: true };
  });
  refresh();
  return res;
}

export async function moveCategory(id: string, delta: -1 | 1) {
  await guard();
  await mutate((db) => {
    const list = [...db.categories].sort((a, b) => a.order - b.order);
    const i = list.findIndex((c) => c.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    list.forEach((c, k) => (c.order = k));
    db.categories = list;
  });
  refresh();
}

// ───────── Projects ─────────
export async function saveProject(input: Project): Promise<{ id: string }> {
  await guard();
  const id = await mutate((db) => {
    const base = slugify(input.slug || input.client);
    let slug = base;
    for (let i = 2; db.projects.some((p) => p.slug === slug && p.id !== input.id); i++) slug = `${base}-${i}`;
    const data = { ...input, slug };
    const i = db.projects.findIndex((p) => p.id === input.id);
    if (i >= 0) {
      db.projects[i] = data;
      return data.id;
    }
    const created = { ...data, id: `prj_${uid()}`, order: -1, createdAt: new Date().toISOString() };
    db.projects.unshift(created);
    db.projects.forEach((p, k) => (p.order = k));
    return created.id;
  });
  refresh();
  return { id };
}

export async function deleteProject(id: string) {
  await guard();
  await mutate((db) => {
    db.projects = db.projects.filter((p) => p.id !== id);
  });
  refresh();
}

export async function patchProject(id: string, patch: Partial<Pick<Project, "featured">>) {
  await guard();
  await mutate((db) => {
    const p = db.projects.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
  });
  refresh();
}

// ───────── Orders ─────────
export async function setOrderStatus(id: string, status: OrderStatus) {
  await guard();
  await mutate((db) => {
    const o = db.orders.find((x) => x.id === id);
    if (!o || o.status === status) return;
    // Return stock when an order is cancelled
    if (status === "cancelled" && o.status !== "cancelled")
      o.items.forEach((it) => {
        const p = db.products.find((x) => x.id === it.productId);
        if (p) p.stock += it.qty;
      });
    o.status = status;
    o.history.push({ status, at: new Date().toISOString() });
  });
  refresh();
}

export async function deleteOrder(id: string) {
  await guard();
  await mutate((db) => {
    db.orders = db.orders.filter((o) => o.id !== id);
  });
  refresh();
}

// ───────── Requests ─────────
export async function updateRequest(id: string, patch: { status?: RequestStatus; note?: string; value?: number | null }) {
  await guard();
  await mutate((db) => {
    const r = db.requests.find((x) => x.id === id);
    if (!r) return;
    if (patch.status) r.status = patch.status;
    if (patch.note?.trim()) r.notes.push({ text: patch.note.trim().slice(0, 2000), at: new Date().toISOString() });
    if (patch.value !== undefined) r.value = patch.value ?? undefined;
  });
  refresh();
}

export async function deleteRequest(id: string) {
  await guard();
  await mutate((db) => {
    db.requests = db.requests.filter((r) => r.id !== id);
  });
  refresh();
}

// ───────── Messages ─────────
export async function markMessage(id: string, read: boolean) {
  await guard();
  await mutate((db) => {
    const m = db.messages.find((x) => x.id === id);
    if (m) m.read = read;
  });
  refresh();
}

export async function deleteMessage(id: string) {
  await guard();
  await mutate((db) => {
    db.messages = db.messages.filter((m) => m.id !== id);
  });
  refresh();
}

// ───────── Settings ─────────
export async function saveSettings(s: Settings) {
  await guard();
  await mutate((db) => {
    db.settings = {
      ...s,
      materials: db.settings.materials, // edited separately in Admin → Fabrics
      notify: db.settings.notify, // edited separately in the Order alerts card
      freeDeliveryOver: Math.max(0, Number(s.freeDeliveryOver) || 0),
      deliveryFees: Object.fromEntries(Object.entries(s.deliveryFees).map(([k, v]) => [k, Math.max(0, Number(v) || 0)])),
    };
  });
  refresh();
}

export async function resetDemoData() {
  await guard();
  await resetDB();
  refresh();
}

/** Before launch: drop the made-up orders, requests and messages, keep catalogue, projects and settings. */
export async function clearDemoActivity() {
  await guard();
  const removed = await mutate((db) => {
    const before = db.orders.length + db.requests.length + db.messages.length;
    db.orders = db.orders.filter((o) => !DEMO_ID.test(o.id));
    db.requests = db.requests.filter((r) => !DEMO_ID.test(r.id));
    db.messages = db.messages.filter((m) => !DEMO_ID.test(m.id));
    return before - (db.orders.length + db.requests.length + db.messages.length);
  });
  refresh();
  return removed;
}

// ───────── Payments ─────────
export async function setOrderPayment(id: string, status: PaymentStatus, amountPaid?: number) {
  await guard();
  await mutate((db) => {
    const o = db.orders.find((x) => x.id === id);
    if (!o) return;
    o.paymentStatus = status;
    o.amountPaid = status === "paid" ? o.total : status === "unpaid" ? 0 : Math.max(0, Math.min(o.total, Math.round(Number(amountPaid) || 0)));
  });
  refresh();
}

// ───────── Inspiration rooms ─────────
const cleanL10n = (v: L10n | undefined, max = 120): L10n => ({ en: String(v?.en ?? "").trim().slice(0, max), ar: String(v?.ar ?? "").trim().slice(0, max) });
const pct = (n: number) => Math.round(Math.max(0, Math.min(100, Number(n) || 0)) * 10) / 10;

export async function saveLook(input: Look): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await guard();
  if (!input.image) return { ok: false, error: "Add a room photo first." };
  if (!input.title?.en?.trim()) return { ok: false, error: "Give the room an English title." };
  const id = await mutate((db) => {
    const products = new Set(db.products.map((p) => p.id));
    const look: Look = {
      id: input.id || slugify(input.title.en) || uid(),
      title: cleanL10n(input.title),
      mood: cleanL10n(input.mood, 160),
      image: String(input.image),
      w: Math.max(1, Math.round(Number(input.w) || 1600)),
      h: Math.max(1, Math.round(Number(input.h) || 900)),
      pins: (input.pins ?? []).filter((p) => products.has(p.productId)).slice(0, 12).map((p) => ({ productId: p.productId, x: pct(p.x), y: pct(p.y) })),
      room: (["living", "bedroom", "dining", "kids", "hall"] as const).find((r) => r === input.room) ?? "living",
      home: Boolean(input.home),
      live: input.live !== false,
      createdAt: input.createdAt || new Date().toISOString(),
    };
    const i = db.looks.findIndex((l) => l.id === input.id);
    if (i >= 0) db.looks[i] = look;
    else {
      while (db.looks.some((l) => l.id === look.id)) look.id = `${look.id}-${uid().slice(-4)}`;
      db.looks.unshift(look); // new rooms lead the lookbook
    }
    return look.id;
  });
  refresh();
  return { ok: true, id };
}

export async function patchLook(id: string, patch: Partial<Pick<Look, "home" | "live">>) {
  await guard();
  await mutate((db) => {
    const l = db.looks.find((x) => x.id === id);
    if (l) Object.assign(l, { ...(patch.home !== undefined && { home: Boolean(patch.home) }), ...(patch.live !== undefined && { live: Boolean(patch.live) }) });
  });
  refresh();
}

export async function moveLook(id: string, dir: -1 | 1) {
  await guard();
  await mutate((db) => {
    const i = db.looks.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= db.looks.length) return;
    [db.looks[i], db.looks[j]] = [db.looks[j], db.looks[i]];
  });
  refresh();
}

export async function deleteLook(id: string) {
  await guard();
  await mutate((db) => {
    db.looks = db.looks.filter((l) => l.id !== id);
  });
  refresh();
}

// ───────── Fabrics & finishes ─────────
export async function saveMaterials(input: MaterialCatalog) {
  await guard();
  const used = new Set<string>();
  const id = (base: string) => {
    let v = slugify(base) || uid();
    while (used.has(v)) v = `${v}-${uid().slice(-3)}`;
    used.add(v);
    return v;
  };
  const family = (list: MaterialCatalog["upholstery"]) =>
    (list ?? [])
      .filter((m) => m.name?.en?.trim())
      .slice(0, 12)
      .map((m) => {
        const mid = m.id && !used.has(m.id) ? (used.add(m.id), m.id) : id(m.name.en);
        const colourIds = new Set<string>();
        return {
          id: mid,
          name: cleanL10n(m.name, 60),
          note: cleanL10n(m.note, 120),
          delta: Math.max(0, Math.min(2, Math.round((Number(m.delta) || 0) * 1000) / 1000)),
          colours: (m.colours ?? [])
            .filter((c) => c.name?.en?.trim() && /^#[0-9a-f]{6}$/i.test(c.hex))
            .slice(0, 16)
            .map((c) => {
              let cid = c.id || slugify(c.name.en) || uid();
              while (colourIds.has(cid)) cid = `${cid}-${uid().slice(-3)}`;
              colourIds.add(cid);
              return { id: cid, name: cleanL10n(c.name, 40), hex: c.hex.toLowerCase() };
            }),
        };
      });
  await mutate((db) => {
    db.settings.materials = { upholstery: family(input.upholstery), wood: family(input.wood) };
  });
  refresh();
}

// ───────── Order alerts ─────────
const str = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);
function cleanNotify(c: Partial<NotifyConfig>): NotifyConfig {
  const e = EMPTY_NOTIFY;
  return {
    events: {
      orders: c.events?.orders ?? e.events.orders,
      quotes: c.events?.quotes ?? e.events.quotes,
      samples: c.events?.samples ?? e.events.samples,
      messages: c.events?.messages ?? e.events.messages,
    },
    telegram: { on: !!c.telegram?.on, token: str(c.telegram?.token, 120), chatId: str(c.telegram?.chatId, 40) },
    whatsapp: { on: !!c.whatsapp?.on, phone: str(c.whatsapp?.phone, 40), apiKey: str(c.whatsapp?.apiKey, 80) },
    email: {
      on: !!c.email?.on,
      apiKey: str(c.email?.apiKey, 120),
      from: str(c.email?.from, 160),
      to: str(c.email?.to, 400),
      receipts: !!c.email?.receipts,
    },
  };
}

export async function saveNotifications(input: NotifyConfig) {
  await guard();
  await mutate((db) => {
    db.settings.notify = cleanNotify(input);
  });
  revalidatePath("/admin/settings");
}

export async function testNotification(channel: Channel, input: NotifyConfig) {
  await guard();
  return sendTest(channel, cleanNotify(input));
}

export async function findTelegramChat(token: string) {
  await guard();
  return telegramChat(str(token, 120));
}
