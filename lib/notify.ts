import "server-only";
import { headers } from "next/headers";
import { after } from "next/server";
import { readDB } from "./db";
import type { Message, NotifyConfig, Order, QuoteRequest } from "./types";

// Order alerts: when a customer orders, asks for a quote, requests samples or writes in,
// the team hears about it on the channels switched on in Admin → Settings → Order alerts.
// Sending happens after the customer's response has gone out, and a failing channel never
// affects the customer.

export type AlertEvent =
  | { kind: "order"; order: Order }
  | { kind: "quote"; req: QuoteRequest }
  | { kind: "samples"; req: QuoteRequest }
  | { kind: "message"; msg: Message };

export type Channel = "telegram" | "whatsapp" | "email";

export const EMPTY_NOTIFY: NotifyConfig = {
  events: { orders: true, quotes: true, samples: true, messages: true },
  telegram: { on: false, token: "", chatId: "" },
  whatsapp: { on: false, phone: "", apiKey: "" },
  email: { on: false, apiKey: "", from: "", to: "", receipts: false },
};

const EVENT_KEY = { order: "orders", quote: "quotes", samples: "samples", message: "messages" } as const;

const PAYMENT = { cod: "Cash on delivery", bank: "Bank transfer", tabby: "Tabby (4 payments)", tamara: "Tamara (pay later)" } as const;
const SERVICE: Record<QuoteRequest["service"], string> = {
  fitout: "Fit-out",
  furniture: "Furniture",
  technical: "Technical works",
  custom: "Custom joinery",
  samples: "Fabric samples",
};

const aed = (n: number) => `AED ${n.toLocaleString("en-US")}`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const short = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** UAE numbers as typed by customers (050…, +971…, 00971…) → wa.me form. */
export function waNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = `971${d.slice(1)}`;
  if (d.length === 9 && d.startsWith("5")) d = `971${d}`;
  return d;
}

/** One alert, channel-neutral: a headline, label/value rows and where to follow up. */
type Alert = { title: string; rows: [string, string][]; note?: string; path: string; phone?: string; email?: string };

function describe(ev: AlertEvent): Alert {
  switch (ev.kind) {
    case "order": {
      const o = ev.order;
      const c = o.customer;
      return {
        title: `New order ${o.number} · ${aed(o.total)}`,
        rows: [
          ["Customer", c.name],
          ["Phone", c.phone],
          ["Deliver to", [c.area, c.emirate].filter(Boolean).join(", ")],
          ...o.items.map((i): [string, string] => [`${i.qty} ×`, [i.name, i.finish, i.size].filter(Boolean).join(" · ")]),
          ["Delivery", o.delivery ? aed(o.delivery) : "Free"],
          ["Payment", PAYMENT[o.payment]],
        ],
        note: o.notes || undefined,
        path: `/admin/orders/${o.id}`,
        phone: c.phone,
        email: c.email,
      };
    }
    case "quote":
    case "samples": {
      const r = ev.req;
      const samples = ev.kind === "samples";
      return {
        title: samples ? `Fabric samples ${r.number}` : `New quote request ${r.number} · ${SERVICE[r.service]}`,
        rows: [
          ["Name", [r.contact.name, r.contact.company].filter(Boolean).join(" · ")],
          ["Phone", r.contact.phone],
          ...(samples
            ? []
            : ([
                ["Space", [r.space, r.area && `${r.area} m²`].filter(Boolean).join(" · ")],
                ["Budget", r.budget],
                ["Timeline", r.timeline],
              ] as [string, string][])),
          ["Emirate", r.emirate],
          ...(r.product ? ([["Product", r.product]] as [string, string][]) : []),
          ...(r.files.length ? ([["Files", `${r.files.length} attached`]] as [string, string][]) : []),
        ].filter(([, v]) => v) as [string, string][],
        note: r.details ? short(r.details, 600) : undefined,
        path: "/admin/requests",
        phone: r.contact.phone,
        email: r.contact.email,
      };
    }
    case "message": {
      const m = ev.msg;
      return {
        title: `New message · ${m.subject}`,
        rows: [["From", m.name], ["Email", m.email], ...(m.phone ? ([["Phone", m.phone]] as [string, string][]) : [])],
        note: short(m.message, 800),
        path: "/admin/messages",
        phone: m.phone,
        email: m.email,
      };
    }
  }
}

const ICON = { order: "🛋️", quote: "📐", samples: "🧵", message: "✉️" } as const;

// ───────── Channels ─────────

async function check(res: Response, what: string) {
  if (res.ok) return;
  let detail = "";
  try {
    const body = await res.text();
    detail = (JSON.parse(body).description || JSON.parse(body).message || body).toString();
  } catch {}
  throw new Error(`${what}: ${short(detail || res.statusText || String(res.status), 200)}`);
}

async function telegram(cfg: NotifyConfig["telegram"], a: Alert, icon: string, origin: string) {
  const text = [
    `${icon} <b>${esc(a.title)}</b>`,
    "",
    ...a.rows.map(([k, v]) => `<b>${esc(k)}</b> ${esc(v)}`),
    ...(a.note ? ["", `<i>${esc(a.note)}</i>`] : []),
  ].join("\n");
  const buttons = [
    // Telegram refuses button links to localhost, so the admin link only appears on the live site.
    ...(origin.startsWith("https://") ? [{ text: "Open in admin", url: origin + a.path }] : []),
    ...(a.phone && waNumber(a.phone).length >= 10 ? [{ text: "WhatsApp customer", url: `https://wa.me/${waNumber(a.phone)}` }] : []),
  ];
  const res = await fetch(`https://api.telegram.org/bot${cfg.token.trim()}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: cfg.chatId.trim(),
      text,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      ...(buttons.length ? { reply_markup: { inline_keyboard: [buttons] } } : {}),
    }),
  });
  await check(res, "Telegram");
}

async function whatsapp(cfg: NotifyConfig["whatsapp"], a: Alert, icon: string, origin: string) {
  const text = [
    `${icon} *${a.title}*`,
    ...a.rows.map(([k, v]) => `${k} ${v}`),
    ...(a.note ? ["", short(a.note, 300)] : []),
    ...(origin.startsWith("https://") ? ["", origin + a.path] : []),
  ].join("\n");
  const q = new URLSearchParams({ phone: `+${waNumber(cfg.phone)}`, text, apikey: cfg.apiKey.trim() });
  const res = await fetch(`https://api.callmebot.com/whatsapp.php?${q}`);
  await check(res, "WhatsApp");
  const body = await res.text();
  if (/APIKey is invalid|not valid|error/i.test(body) && !/queued|sent/i.test(body)) throw new Error(`WhatsApp: ${short(body.replace(/<[^>]+>/g, " ").trim(), 200)}`);
}

const emailShell = (inner: string) =>
  `<div style="background:#F7F6F4;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1d1b19">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e4df;border-radius:16px;padding:28px">
    <p style="margin:0 0 18px;font-size:13px;letter-spacing:.24em;font-weight:600">TANFEEZ</p>${inner}
  </div></div>`;

function alertEmail(a: Alert, origin: string) {
  const rows = a.rows
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#8a847d;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
    .join("");
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:600">${esc(a.title)}</h1>
    <table style="border-collapse:collapse;font-size:14px;width:100%">${rows}</table>
    ${a.note ? `<p style="margin:16px 0 0;padding:14px;background:#F7F6F4;border-radius:10px;font-size:14px;white-space:pre-wrap">${esc(a.note)}</p>` : ""}
    <p style="margin:22px 0 0"><a href="${origin + a.path}" style="display:inline-block;background:#1d1b19;color:#fff;text-decoration:none;padding:11px 22px;border-radius:999px;font-size:14px">Open in admin</a></p>`);
}

function receiptEmail(o: Order, origin: string) {
  const lines = o.items
    .map((i) => `<tr><td style="padding:8px 0">${i.qty} × ${esc(i.name)}${i.finish ? `<br><span style="color:#8a847d;font-size:13px">${esc(i.finish)}</span>` : ""}</td><td style="padding:8px 0;text-align:right;white-space:nowrap">${aed(i.price * i.qty)}</td></tr>`)
    .join("");
  return emailShell(`
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:600">Thank you, ${esc(o.customer.name.split(" ")[0])}.</h1>
    <p style="margin:0 0 4px;font-size:15px" dir="rtl">شكراً لطلبك من تنفيذ.</p>
    <p style="margin:0 0 20px;color:#5f5a54;font-size:14px">We've received order <b>${o.number}</b>. Our team will call you within one working day to confirm the details and delivery date.</p>
    <table style="border-collapse:collapse;font-size:14px;width:100%;border-top:1px solid #e8e4df">${lines}
      <tr><td style="padding:8px 0;border-top:1px solid #e8e4df;color:#8a847d">Delivery</td><td style="padding:8px 0;border-top:1px solid #e8e4df;text-align:right">${o.delivery ? aed(o.delivery) : "Free"}</td></tr>
      <tr><td style="padding:8px 0;font-weight:600">Total (incl. VAT)</td><td style="padding:8px 0;text-align:right;font-weight:600">${aed(o.total)}</td></tr>
    </table>
    <p style="margin:16px 0 0;color:#5f5a54;font-size:14px">Payment: ${PAYMENT[o.payment]}</p>
    <p style="margin:22px 0 0"><a href="${origin}/track?n=${encodeURIComponent(o.number)}" style="display:inline-block;background:#1d1b19;color:#fff;text-decoration:none;padding:11px 22px;border-radius:999px;font-size:14px">Track your order</a></p>`);
}

async function resend(cfg: NotifyConfig["email"], msg: { to: string[]; subject: string; html: string; replyTo?: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${cfg.apiKey.trim()}`, "content-type": "application/json" },
    body: JSON.stringify({ from: cfg.from.trim(), to: msg.to, subject: msg.subject, html: msg.html, ...(msg.replyTo ? { reply_to: msg.replyTo } : {}) }),
  });
  await check(res, "Email");
}

const recipients = (s: string) => s.split(/[,;\s]+/).map((x) => x.trim()).filter((x) => x.includes("@"));

async function sendOne(ch: Channel, cfg: NotifyConfig, ev: AlertEvent, origin: string) {
  const a = describe(ev);
  const icon = ICON[ev.kind];
  if (ch === "telegram") return telegram(cfg.telegram, a, icon, origin);
  if (ch === "whatsapp") return whatsapp(cfg.whatsapp, a, icon, origin);
  const to = recipients(cfg.email.to);
  if (!to.length) throw new Error("Email: add at least one address to send alerts to");
  await resend(cfg.email, { to, subject: a.title, html: alertEmail(a, origin), replyTo: a.email?.includes("@") ? a.email : undefined });
  if (ev.kind === "order" && cfg.email.receipts && ev.order.customer.email.includes("@"))
    await resend(cfg.email, { to: [ev.order.customer.email], subject: `Your TANFEEZ order ${ev.order.number}`, html: receiptEmail(ev.order, origin) });
}

const ready = (ch: Channel, cfg: NotifyConfig) =>
  ch === "telegram"
    ? cfg.telegram.on && !!cfg.telegram.token.trim() && !!cfg.telegram.chatId.trim()
    : ch === "whatsapp"
      ? cfg.whatsapp.on && waNumber(cfg.whatsapp.phone).length >= 10 && !!cfg.whatsapp.apiKey.trim()
      : cfg.email.on && !!cfg.email.apiKey.trim() && !!cfg.email.from.trim();

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

/** Queue alerts for a new order/request/message. Runs after the response; never throws. */
export async function notify(ev: AlertEvent) {
  try {
    const cfg = (await readDB()).settings.notify;
    if (!cfg || !cfg.events[EVENT_KEY[ev.kind]]) return;
    const channels = (["telegram", "whatsapp", "email"] as const).filter((ch) => ready(ch, cfg));
    if (!channels.length) return;
    const base = await origin();
    after(async () => {
      const results = await Promise.allSettled(channels.map((ch) => sendOne(ch, cfg, ev, base)));
      for (const r of results) if (r.status === "rejected") console.error("[alerts]", r.reason);
    });
  } catch (e) {
    console.error("[alerts]", e);
  }
}

/** A sample order sent through one channel with the settings as typed, for the "Send test" buttons. */
export async function sendTest(ch: Channel, cfg: NotifyConfig): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ready(ch, { ...cfg, [ch]: { ...cfg[ch], on: true } }))
    return { ok: false, error: ch === "whatsapp" ? "Add the phone number and API key first." : ch === "telegram" ? "Add the bot token and chat ID first." : "Add the API key and From address first." };
  const now = new Date().toISOString();
  const order: Order = {
    id: "test",
    number: "TNF-TEST",
    customer: { name: "Test customer", phone: "050 000 0000", email: "", emirate: "Dubai", area: "Jumeirah", address: "—" },
    items: [{ productId: "", slug: "", name: "Lune modular sofa", image: "", price: 12400, qty: 1, finish: "Boucle · Sand", size: "3-seater" }],
    subtotal: 12400,
    delivery: 0,
    vat: 590,
    total: 12400,
    payment: "tabby",
    notes: "This is a test alert from TANFEEZ Admin → Settings. If you can read it, alerts are working.",
    status: "new",
    history: [{ status: "new", at: now }],
    createdAt: now,
  };
  try {
    await sendOne(ch, { ...cfg, email: { ...cfg.email, receipts: false } }, { kind: "order", order }, await origin());
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** The chat that most recently messaged the bot, so nobody has to dig for a chat ID. */
export async function telegramChat(token: string): Promise<{ ok: true; chatId: string; name: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/getUpdates?limit=50`);
    if (res.status === 401 || res.status === 404) return { ok: false, error: "That bot token isn't valid — copy it again from @BotFather." };
    await check(res, "Telegram");
    const { result } = (await res.json()) as { result: { message?: { chat: { id: number; title?: string; first_name?: string; username?: string } }; my_chat_member?: { chat: { id: number; title?: string } } }[] };
    const chat = [...result].reverse().map((u) => u.message?.chat ?? u.my_chat_member?.chat).find(Boolean);
    if (!chat) return { ok: false, error: "No messages yet. Open your bot in Telegram, tap Start (or send it any message), then try again." };
    const c = chat as { id: number; title?: string; first_name?: string; username?: string };
    return { ok: true, chatId: String(c.id), name: c.title || c.first_name || c.username || "your chat" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
