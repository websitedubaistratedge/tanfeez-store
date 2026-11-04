import "server-only";
import { mutate, readDB } from "./db";
import { notify } from "./notify";
import type { Customer, GatewayPayment, GatewayProvider, GatewayState, Order, PaymentsConfig } from "./types";

// Online payments through Tabby (pay in 4), Tamara (pay in 3) and Ziina (cards, Apple Pay, Google Pay).
//
// Flow: placeOrder() saves the order, startPayment() opens a session with the provider and the
// customer is sent to its hosted page. When they come back (/checkout/return) or the provider
// calls our webhook (/api/payments/*), syncPayment() asks the provider for the real status, the
// only source of truth, and moves the order on. Paid orders trigger the usual order alerts;
// failed or abandoned ones are cancelled and their stock returned.
//
// Tabby and Tamara approve (authorise) first; the money is captured when the order is marked
// "Out for delivery" (or with the Capture button), as both providers ask. Ziina charges at once.

export const EMPTY_PAYMENTS: PaymentsConfig = {
  mode: "test",
  tabby: { on: false, secretKey: "", publicKey: "", merchantCode: "", webhookSecret: "" },
  tamara: { on: false, apiToken: "", notificationToken: "", publicKey: "" },
  ziina: { on: false, apiKey: "", webhookSecret: "" },
};

// PAYMENTS_MOCK_URL points all three at a local stand-in during development (never set in production).
const MOCK = process.env.NODE_ENV !== "production" ? process.env.PAYMENTS_MOCK_URL : undefined;
const TABBY = MOCK ? `${MOCK}/tabby` : "https://api.tabby.ai";
const tamaraApi = (c: PaymentsConfig) => (MOCK ? `${MOCK}/tamara` : c.mode === "live" ? "https://api.tamara.co" : "https://api-sandbox.tamara.co");
const ZIINA = MOCK ? `${MOCK}/ziina` : "https://api-v2.ziina.com/api";

/** Which checkout payment option each provider serves. */
export const PROVIDER_FOR = { tabby: "tabby", tamara: "tamara", card: "ziina" } as const satisfies Partial<Record<Order["payment"], GatewayProvider>>;
export const PROVIDER_NAME: Record<GatewayProvider, string> = { tabby: "Tabby", tamara: "Tamara", ziina: "Ziina" };

export function ready(c: PaymentsConfig | undefined, p: GatewayProvider) {
  if (!c) return false;
  if (p === "tabby") return c.tabby.on && !!c.tabby.secretKey.trim() && !!c.tabby.merchantCode.trim();
  if (p === "tamara") return c.tamara.on && !!c.tamara.apiToken.trim();
  return c.ziina.on && !!c.ziina.apiKey.trim();
}

/** What the website may know: which online methods are switched on. */
export const publicPayments = (c?: PaymentsConfig) => ({ tabby: ready(c, "tabby"), tamara: ready(c, "tamara"), card: ready(c, "ziina") });

// ───────── HTTP ─────────
type Json = Record<string, unknown>;
export class GatewayError extends Error {
  constructor(message: string, public status = 0, public code = "") {
    super(message);
  }
}

async function call(provider: GatewayProvider, url: string, init: { method?: string; token: string; body?: unknown; headers?: Record<string, string> }): Promise<Json> {
  const res = await fetch(url, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: { authorization: `Bearer ${init.token.trim()}`, accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  let data: Json = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text.slice(0, 300) };
  }
  if (!res.ok) {
    const errs = (data.errors as { message?: string; error_code?: string }[] | undefined) ?? [];
    const msg = String(data.message || data.error || errs[0]?.message || errs[0]?.error_code || res.statusText || "Request failed");
    throw new GatewayError(`${PROVIDER_NAME[provider]}: ${msg} (${res.status})`, res.status, String(errs[0]?.error_code ?? ""));
  }
  return data;
}

const money = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
const aed = (n: number) => ({ amount: Math.round(n * 100) / 100, currency: "AED" });
const ddmmyyyy = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;
};
/** UAE numbers as customers type them → +9715XXXXXXXX. */
export function e164(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = `971${d.slice(1)}`;
  if (d.length === 9 && d.startsWith("5")) d = `971${d}`;
  return `+${d}`;
}
const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] || "Customer", last: parts.slice(1).join(" ") || parts[0] || "Customer" };
};
const abs = (origin: string, path: string) => (/^https?:/.test(path) ? path : `${origin}${path.startsWith("/") ? "" : "/"}${path}`);

// ───────── Start ─────────
export type StartResult = { ok: true; url: string; gateway: GatewayPayment } | { ok: false; reason: "rejected" | "unavailable"; message: string };

export async function startPayment(
  order: Order,
  ctx: { origin: string; lang: "en" | "ar"; customer: Customer | null; history: Order[] }
): Promise<StartResult> {
  const { settings } = await readDB();
  const c = settings.payments;
  const provider = PROVIDER_FOR[order.payment as keyof typeof PROVIDER_FOR];
  if (!c || !provider || !ready(c, provider)) return { ok: false, reason: "unavailable", message: "This payment method isn't switched on." };

  const back = (r: "success" | "cancel" | "failure") => `${ctx.origin}/checkout/return?o=${encodeURIComponent(order.id)}&r=${r}`;
  const cu = order.customer;
  const name = splitName(cu.name);
  const phone = e164(cu.phone);
  const paidBefore = ctx.history.filter((h) => h.status !== "cancelled");
  const now = new Date().toISOString();
  const gateway = (ref: string, test: boolean): GatewayPayment => ({ provider, ref, state: "pending", test, captured: false, refunded: 0, updatedAt: now, log: [{ at: now, note: "Sent to payment page" }] });

  try {
    if (provider === "tabby") {
      const shipping = { city: cu.emirate, address: [cu.address, cu.area].filter(Boolean).join(", "), zip: "00000" };
      const res = await call("tabby", `${TABBY}/api/v2/checkout`, {
        token: c.tabby.secretKey,
        body: {
          payment: {
            amount: money(order.total),
            currency: "AED",
            description: `TANFEEZ order ${order.number}`,
            buyer: { name: cu.name, email: cu.email, phone },
            shipping_address: shipping,
            order: {
              reference_id: order.number,
              tax_amount: money(order.vat),
              shipping_amount: money(order.delivery),
              discount_amount: "0.00",
              updated_at: now,
              items: order.items.map((i) => ({
                reference_id: i.slug || i.productId,
                title: i.name,
                description: [i.finish, i.size].filter(Boolean).join(" · ") || undefined,
                quantity: i.qty,
                unit_price: money(i.price),
                discount_amount: "0.00",
                image_url: i.image ? abs(ctx.origin, i.image) : undefined,
                product_url: i.slug ? `${ctx.origin}/shop/${i.slug}` : undefined,
                category: "Furniture",
              })),
            },
            buyer_history: { registered_since: ctx.customer?.createdAt ?? now, loyalty_level: paidBefore.length },
            order_history: paidBefore.slice(0, 10).map((h) => ({
              purchased_at: h.createdAt,
              amount: money(h.total),
              status: h.status === "delivered" ? "complete" : h.status === "cancelled" ? "canceled" : "processing",
              buyer: { name: h.customer.name, email: h.customer.email, phone: e164(h.customer.phone) },
              shipping_address: { city: h.customer.emirate, address: h.customer.address, zip: "00000" },
            })),
          },
          lang: ctx.lang,
          merchant_code: c.tabby.merchantCode.trim(),
          merchant_urls: { success: back("success"), cancel: back("cancel"), failure: back("failure") },
        },
      });
      const cfg = res.configuration as { available_products?: { installments?: { web_url?: string }[] }; products?: { installments?: { rejection_reason?: string } } } | undefined;
      const url = cfg?.available_products?.installments?.[0]?.web_url;
      const payment = res.payment as { id?: string; is_test?: boolean } | undefined;
      if (res.status === "rejected" || !url || !payment?.id)
        return { ok: false, reason: "rejected", message: `Tabby declined this order (${cfg?.products?.installments?.rejection_reason ?? "not available"}).` };
      return { ok: true, url, gateway: gateway(payment.id, payment.is_test ?? c.tabby.secretKey.includes("_test_")) };
    }

    if (provider === "tamara") {
      const res = await call("tamara", `${tamaraApi(c)}/checkout`, {
        token: c.tamara.apiToken,
        body: {
          order_reference_id: order.id,
          order_number: order.number,
          total_amount: aed(order.total),
          shipping_amount: aed(order.delivery),
          tax_amount: aed(order.vat),
          description: `TANFEEZ order ${order.number}`,
          country_code: "AE",
          payment_type: "PAY_BY_INSTALMENTS",
          instalments: 3,
          locale: ctx.lang === "ar" ? "ar_SA" : "en_US",
          platform: "TANFEEZ website",
          is_mobile: false,
          items: order.items.map((i) => ({
            reference_id: i.productId,
            type: "Physical",
            name: i.name,
            sku: i.slug || i.productId,
            quantity: i.qty,
            unit_price: aed(i.price),
            total_amount: aed(i.price * i.qty),
            image_url: i.image ? abs(ctx.origin, i.image) : undefined,
            item_url: i.slug ? `${ctx.origin}/shop/${i.slug}` : undefined,
          })),
          consumer: { first_name: name.first, last_name: name.last, phone_number: phone, email: cu.email },
          shipping_address: { first_name: name.first, last_name: name.last, line1: cu.address, line2: cu.area, city: cu.emirate, country_code: "AE", phone_number: phone },
          merchant_url: { success: back("success"), failure: back("failure"), cancel: back("cancel") }, // notifications are set up in Tamara's Partner Portal
          risk_assessment: {
            is_premium_customer: false,
            account_creation_date: ddmmyyyy(ctx.customer?.createdAt ?? now),
            total_order_count: paidBefore.length,
            date_first_paid: ddmmyyyy(paidBefore.at(-1)?.createdAt ?? now),
            date_last_paid: ddmmyyyy(paidBefore[0]?.createdAt ?? now),
          },
        },
      });
      if (!res.checkout_url || !res.order_id) return { ok: false, reason: "rejected", message: "Tamara couldn't open a checkout for this order." };
      return { ok: true, url: String(res.checkout_url), gateway: gateway(String(res.order_id), c.mode !== "live") };
    }

    const res = await call("ziina", `${ZIINA}/payment_intent`, {
      token: c.ziina.apiKey,
      body: {
        amount: Math.round(order.total * 100), // fils
        currency_code: "AED",
        message: `TANFEEZ order ${order.number}`,
        success_url: back("success"),
        cancel_url: back("cancel"),
        failure_url: back("failure"),
        test: c.mode !== "live",
      },
    });
    if (!res.redirect_url || !res.id) return { ok: false, reason: "unavailable", message: "Ziina didn't return a payment page." };
    return { ok: true, url: String(res.redirect_url), gateway: gateway(String(res.id), c.mode !== "live") };
  } catch (e) {
    console.error("[payments] start", e);
    const status = e instanceof GatewayError ? e.status : 0;
    return { ok: false, reason: status === 400 || status === 422 ? "rejected" : "unavailable", message: e instanceof Error ? e.message : String(e) };
  }
}

// ───────── Status ─────────
type Remote = { state: GatewayState; captured: boolean; refunded?: number; note: string };

async function remoteStatus(c: PaymentsConfig, g: GatewayPayment): Promise<Remote> {
  if (g.provider === "tabby") {
    const p = await call("tabby", `${TABBY}/api/v2/payments/${encodeURIComponent(g.ref)}`, { token: c.tabby.secretKey });
    const status = String(p.status ?? "").toUpperCase();
    const captures = (p.captures as unknown[] | undefined) ?? [];
    const refunded = ((p.refunds as { amount?: string }[] | undefined) ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const amount = Number(p.amount ?? 0);
    if (status === "AUTHORIZED") return { state: captures.length ? "paid" : "authorized", captured: captures.length > 0, refunded, note: "Tabby: authorized" };
    if (status === "CLOSED")
      return captures.length
        ? { state: refunded >= amount && amount > 0 ? "refunded" : "paid", captured: true, refunded, note: "Tabby: closed" }
        : { state: "cancelled", captured: false, note: "Tabby: closed without capture" };
    if (status === "REJECTED") return { state: "failed", captured: false, note: "Tabby: rejected" };
    if (status === "EXPIRED") return { state: "cancelled", captured: false, note: "Tabby: expired" };
    return { state: "pending", captured: false, note: `Tabby: ${status.toLowerCase() || "created"}` };
  }

  if (g.provider === "tamara") {
    const base = tamaraApi(c);
    let o = await call("tamara", `${base}/orders/${encodeURIComponent(g.ref)}`, { token: c.tamara.apiToken });
    // Approved means the customer finished; we authorise to confirm the order (unless Tamara did it already).
    if (o.status === "approved") {
      await call("tamara", `${base}/orders/${encodeURIComponent(g.ref)}/authorise`, { token: c.tamara.apiToken, method: "POST" });
      o = await call("tamara", `${base}/orders/${encodeURIComponent(g.ref)}`, { token: c.tamara.apiToken });
    }
    const status = String(o.status ?? "");
    const refunded = Number((o.refunded_amount as { amount?: number } | undefined)?.amount ?? 0);
    if (status === "authorised" || status === "updated") return { state: "authorized", captured: false, note: `Tamara: ${status}` };
    if (status === "partially_captured" || status === "fully_captured" || status === "partially_refunded") return { state: "paid", captured: true, refunded, note: `Tamara: ${status}` };
    if (status === "fully_refunded") return { state: "refunded", captured: true, refunded, note: "Tamara: fully refunded" };
    if (status === "declined") return { state: "failed", captured: false, note: "Tamara: declined" };
    if (status === "expired" || status === "canceled") return { state: "cancelled", captured: false, note: `Tamara: ${status}` };
    return { state: "pending", captured: false, note: `Tamara: ${status || "new"}` };
  }

  const p = await call("ziina", `${ZIINA}/payment_intent/${encodeURIComponent(g.ref)}`, { token: c.ziina.apiKey });
  const status = String(p.status ?? "");
  if (status === "completed") return { state: "paid", captured: true, note: "Ziina: completed" }; // refunds are tracked on our side
  if (status === "failed") return { state: "failed", captured: false, note: "Ziina: failed" };
  if (status === "canceled") return { state: "cancelled", captured: false, note: "Ziina: cancelled" };
  return { state: "pending", captured: false, note: `Ziina: ${status || "pending"}` };
}

const RANK: Record<GatewayState, number> = { pending: 0, failed: 1, cancelled: 1, authorized: 2, paid: 3, refunded: 4 };

/**
 * Ask the provider where an order's payment stands and update the order to match.
 * Safe to call any number of times (returns, webhooks, admin "Check status").
 */
export async function syncPayment(orderId: string): Promise<GatewayState | null> {
  const db = await readDB();
  const order = db.orders.find((o) => o.id === orderId);
  const c = db.settings.payments;
  if (!order?.gateway || !c) return order?.gateway?.state ?? null;
  const remote = await remoteStatus(c, order.gateway);
  return applyRemote(orderId, remote);
}

async function applyRemote(orderId: string, remote: Remote): Promise<GatewayState | null> {
  let confirmed: Order | null = null;
  const state = await mutate((db) => {
    const o = db.orders.find((x) => x.id === orderId);
    const g = o?.gateway;
    if (!o || !g) return null;
    const at = new Date().toISOString();
    const prev = g.state;
    // Never move backwards (late or out-of-order notifications), except: an approval can be
    // voided (authorized → cancelled) and a payment can be refunded.
    const allowed =
      remote.state === prev ||
      RANK[remote.state] > RANK[prev] ||
      (prev === "pending" && (remote.state === "failed" || remote.state === "cancelled")) ||
      (prev === "authorized" && remote.state === "cancelled");
    if (allowed && remote.state !== prev) {
      g.state = remote.state;
      g.log.push({ at, note: remote.note });
      if ((remote.state === "authorized" || remote.state === "paid") && prev === "pending") {
        o.paymentStatus = "paid";
        o.amountPaid = o.total;
        confirmed = o;
      }
      if ((remote.state === "failed" || remote.state === "cancelled") && o.status !== "cancelled") {
        for (const it of o.items) {
          const p = db.products.find((x) => x.id === it.productId);
          if (p) p.stock += it.qty;
        }
        o.status = "cancelled";
        o.history.push({ status: "cancelled", at });
        o.paymentStatus = "unpaid";
        o.amountPaid = 0;
      }
    }
    g.captured = g.captured || remote.captured;
    if (remote.refunded !== undefined) g.refunded = Math.max(g.refunded, Math.round(remote.refunded * 100) / 100);
    if (g.refunded > 0) o.amountPaid = Math.max(0, o.total - g.refunded);
    g.updatedAt = at;
    return g.state;
  });
  if (confirmed) await notify({ kind: "order", order: confirmed });
  return state;
}

async function withOrder(orderId: string) {
  const db = await readDB();
  const order = db.orders.find((o) => o.id === orderId);
  const c = db.settings.payments;
  if (!order?.gateway || !c) throw new GatewayError("This order wasn't paid online.");
  return { order, g: order.gateway, c };
}

async function logNote(orderId: string, note: string, patch?: (g: GatewayPayment) => void) {
  await mutate((db) => {
    const g = db.orders.find((x) => x.id === orderId)?.gateway;
    if (!g) return;
    g.log.push({ at: new Date().toISOString(), note });
    patch?.(g);
  });
}

// ───────── Capture, void, refund ─────────
/** Take the approved money (Tabby/Tamara). Ziina payments are captured at checkout. */
export async function capturePayment(orderId: string) {
  const { order, g, c } = await withOrder(orderId);
  if (g.captured || g.provider === "ziina") return syncPayment(orderId);
  if (g.state !== "authorized") throw new GatewayError("Only approved payments can be captured.");
  if (g.provider === "tabby")
    await call("tabby", `${TABBY}/api/v2/payments/${encodeURIComponent(g.ref)}/captures`, {
      token: c.tabby.secretKey,
      body: { amount: money(order.total), reference_id: `${order.number}-capture`, tax_amount: money(order.vat), shipping_amount: money(order.delivery) },
    });
  else
    await call("tamara", `${tamaraApi(c)}/payments/capture`, {
      token: c.tamara.apiToken,
      body: { order_id: g.ref, total_amount: aed(order.total), shipping_amount: aed(order.delivery), tax_amount: aed(order.vat), shipping_info: { shipped_at: new Date().toISOString(), shipping_company: "TANFEEZ delivery & installation" } },
    });
  await logNote(orderId, `Captured ${money(order.total)} AED`, (x) => (x.captured = true));
  return syncPayment(orderId);
}

/** Release an approval that hasn't been captured (order cancelled before delivery). */
export async function voidPayment(orderId: string) {
  const { order, g, c } = await withOrder(orderId);
  if (g.state !== "authorized" || g.captured) throw new GatewayError(g.provider === "ziina" ? "Card payments are refunded instead." : "Only approved, uncaptured payments can be cancelled. Refund it instead.");
  if (g.provider === "tabby") await call("tabby", `${TABBY}/api/v2/payments/${encodeURIComponent(g.ref)}/close`, { token: c.tabby.secretKey, method: "POST" });
  else if (g.provider === "tamara") await call("tamara", `${tamaraApi(c)}/orders/${encodeURIComponent(g.ref)}/cancel`, { token: c.tamara.apiToken, body: { total_amount: aed(order.total) } });
  await logNote(orderId, "Approval cancelled");
  await applyRemote(orderId, { state: "cancelled", captured: false, note: `${PROVIDER_NAME[g.provider]}: approval cancelled` });
}

export async function refundPayment(orderId: string, amount: number, reason: string) {
  const { order, g, c } = await withOrder(orderId);
  const max = Math.round((order.total - g.refunded) * 100) / 100;
  const amt = Math.round(Math.min(max, Math.max(0, amount)) * 100) / 100;
  if (!(amt > 0)) throw new GatewayError("Nothing left to refund.");
  if (!g.captured || (g.state !== "paid" && g.state !== "refunded")) throw new GatewayError("Capture the payment first, or cancel the approval instead.");
  const ref = `${order.number}-refund-${g.log.filter((l) => l.note.startsWith("Refunded")).length + 1}`;
  if (g.provider === "tabby")
    await call("tabby", `${TABBY}/api/v2/payments/${encodeURIComponent(g.ref)}/refunds`, { token: c.tabby.secretKey, body: { amount: money(amt), reference_id: ref, reason: reason || "Refund" } });
  else if (g.provider === "tamara")
    await call("tamara", `${tamaraApi(c)}/payments/simplified-refund/${encodeURIComponent(g.ref)}`, { token: c.tamara.apiToken, body: { total_amount: aed(amt), comment: reason || `Refund for ${order.number}`, merchant_refund_id: ref } });
  else
    await call("ziina", `${ZIINA}/refund`, { token: c.ziina.apiKey, body: { id: crypto.randomUUID(), payment_intent_id: g.ref, amount: Math.round(amt * 100), currency_code: "AED", test: c.mode !== "live" } });
  const refunded = Math.round((g.refunded + amt) * 100) / 100;
  await logNote(orderId, `Refunded ${money(amt)} AED${reason ? ` · ${reason}` : ""}`);
  await applyRemote(orderId, { state: refunded >= order.total ? "refunded" : "paid", captured: true, refunded, note: refunded >= order.total ? "Fully refunded" : "Partly refunded" });
}

/** Re-check orders left waiting on a payment page (customer closed the tab, webhook missed). */
export async function syncStalePayments(limit = 5) {
  const db = await readDB();
  if (!db.settings.payments) return;
  const stale = db.orders.filter((o) => o.gateway?.state === "pending" && Date.now() - Date.parse(o.gateway.updatedAt) > 10 * 60_000).slice(0, limit);
  await Promise.allSettled(stale.map((o) => syncPayment(o.id)));
}

export async function findOrderByRef(provider: GatewayProvider, ref: string) {
  const db = await readDB();
  return db.orders.find((o) => o.gateway?.provider === provider && o.gateway.ref === ref) ?? null;
}

// ───────── Admin: connection checks and webhooks ─────────
const ZERO = "00000000-0000-4000-8000-000000000000";

/** A harmless authenticated request: a wrong key gives 401/403, a good one "not found". */
export async function testConnection(c: PaymentsConfig, p: GatewayProvider): Promise<{ ok: boolean; message: string }> {
  try {
    if (p === "tabby") await call("tabby", `${TABBY}/api/v2/payments/${ZERO}`, { token: c.tabby.secretKey });
    else if (p === "tamara") await call("tamara", `${tamaraApi(c)}/orders/${ZERO}`, { token: c.tamara.apiToken });
    else await call("ziina", `${ZIINA}/payment_intent/${ZERO}`, { token: c.ziina.apiKey });
    return { ok: true, message: "Connected." };
  } catch (e) {
    const status = e instanceof GatewayError ? e.status : 0;
    if (status === 401 || status === 403) return { ok: false, message: "The key was refused. Check you copied the right one for this mode." };
    if (status === 404 || status === 400 || status === 422) return { ok: true, message: "Connected." };
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/** Tell Tabby or Ziina where to send payment updates. Tamara's is set in its Partner Portal. */
export async function registerWebhook(c: PaymentsConfig, p: "tabby" | "ziina", origin: string, secret: string) {
  if (p === "tabby")
    await call("tabby", `${TABBY}/api/v1/webhooks`, {
      token: c.tabby.secretKey,
      headers: { "X-Merchant-Code": c.tabby.merchantCode.trim() },
      body: { url: `${origin}/api/payments/tabby`, header: { title: "X-Tanfeez-Key", value: secret } },
    });
  else await call("ziina", `${ZIINA}/webhook`, { token: c.ziina.apiKey, body: { url: `${origin}/api/payments/ziina`, secret } });
}

// ───────── Webhook authenticity ─────────
const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer) => Buffer.from(new Uint8Array(buf)).toString("base64url");
export function sameText(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function hmac(key: string, data: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}
/** Tamara signs notifications as an HS256 JWT with the notification token. */
export async function verifyTamaraJwt(token: string, secret: string) {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s || !secret) return false;
  if (!sameText(b64url(await hmac(secret, `${h}.${p}`)), s)) return false;
  try {
    const claims = JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as { exp?: number };
    return !claims.exp || claims.exp > Date.now() / 1000 - 300;
  } catch {
    return false;
  }
}
/** Ziina's X-Hmac-Signature: hex SHA-256 HMAC of the raw body. */
export async function verifyZiina(body: string, signature: string, secret: string) {
  const hex = Buffer.from(new Uint8Array(await hmac(secret, body))).toString("hex");
  return sameText(hex, signature.trim().toLowerCase());
}
