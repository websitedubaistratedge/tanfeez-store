"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, createSession, destroySession, isAdmin } from "./auth";
import { DEMO_ID, mutate, resetDB, uid } from "./db";
import { saveUpload, uploadStore } from "./uploads";
import type { Category, OrderStatus, PaymentStatus, Product, Project, RequestStatus, Settings } from "./types";

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
