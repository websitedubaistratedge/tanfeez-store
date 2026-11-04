import "server-only";
import { cookies } from "next/headers";
import { d1, ensure, uid } from "./db";
import type { AccountInfo, Customer } from "./types";

// Customer accounts. Each customer is one row in the D1 `customers` table: profile JSON in
// `data`, and the password hash plus a session version in `secret`, which never leaves this
// file. Sessions are a signed cookie (id + expiry + version); bumping the version signs the
// customer out everywhere, e.g. after a password change.

const COOKIE = "tz_user";
const TTL = 60 * 60 * 24 * 60; // 60 days
const ITERATIONS = 100_000; // the most PBKDF2 rounds Cloudflare Workers allow

type Secret = { hash: string; v: number };
type Row = { id: string; email: string; data: string; secret: string; created: string };

const enc = new TextEncoder();
const b64 = (buf: ArrayBuffer | Uint8Array) => Buffer.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).toString("base64url");
const unb64 = (s: string) => new Uint8Array(Buffer.from(s, "base64url")) as Uint8Array<ArrayBuffer>;
export const normEmail = (e: string) => e.trim().toLowerCase();

// Without D1 (plain Node, build) accounts live in memory for the life of the process.
const memory = new Map<string, Row>();
let memorySecret = "";

async function db() {
  const d = await d1();
  if (d) await ensure(d);
  return d;
}

// ───────── Passwords ─────────
async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
}
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(await pbkdf2(password, salt, ITERATIONS))}`;
}
async function verifyPassword(password: string, stored: string) {
  const [, it, salt, hash] = stored.split("$");
  const got = await pbkdf2(password, unb64(salt), Number(it));
  const want = unb64(hash);
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i];
  return diff === 0;
}

// ───────── Storage ─────────
const toCustomer = (r: Row): Customer => ({ ...JSON.parse(r.data), id: r.id, email: r.email, createdAt: r.created });

async function rowById(id: string): Promise<Row | null> {
  const d = await db();
  if (!d) return [...memory.values()].find((r) => r.id === id) ?? null;
  return d.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first<Row>();
}
async function rowByEmail(email: string): Promise<Row | null> {
  const d = await db();
  if (!d) return memory.get(normEmail(email)) ?? null;
  return d.prepare("SELECT * FROM customers WHERE email = ?").bind(normEmail(email)).first<Row>();
}

function profileJson(c: Customer) {
  const { id: _id, email: _email, createdAt: _created, ...rest } = c;
  return JSON.stringify(rest);
}

export async function createCustomer(c: Omit<Customer, "id" | "createdAt">, password: string): Promise<Customer | "exists"> {
  const row: Row = {
    id: `cus_${uid()}`,
    email: normEmail(c.email),
    data: "",
    secret: JSON.stringify({ hash: await hashPassword(password), v: 1 } satisfies Secret),
    created: new Date().toISOString(),
  };
  const customer: Customer = { ...c, id: row.id, email: row.email, createdAt: row.created };
  row.data = profileJson(customer);
  const d = await db();
  if (!d) {
    if (memory.has(row.email)) return "exists";
    memory.set(row.email, row);
    return customer;
  }
  const res = await d.prepare("INSERT OR IGNORE INTO customers (id, email, data, secret, created) VALUES (?, ?, ?, ?, ?)").bind(row.id, row.email, row.data, row.secret, row.created).run();
  return res.meta.changes ? customer : "exists";
}

export async function saveCustomer(c: Customer) {
  const d = await db();
  if (!d) {
    const r = memory.get(c.email);
    if (r) r.data = profileJson(c);
    return;
  }
  await d.prepare("UPDATE customers SET data = ? WHERE id = ?").bind(profileJson(c), c.id).run();
}

async function writeSecret(id: string, s: Secret) {
  const d = await db();
  if (!d) {
    const r = [...memory.values()].find((x) => x.id === id);
    if (r) r.secret = JSON.stringify(s);
    return;
  }
  await d.prepare("UPDATE customers SET secret = ? WHERE id = ?").bind(JSON.stringify(s), id).run();
}

/** Check an email + password; returns the customer on success. */
export async function authenticate(email: string, password: string): Promise<Customer | null> {
  const r = await rowByEmail(email);
  if (!r) {
    await hashPassword(password); // same work either way, so timing doesn't reveal which emails exist
    return null;
  }
  const s = JSON.parse(r.secret) as Secret;
  return (await verifyPassword(password, s.hash)) ? toCustomer(r) : null;
}

export async function checkPasswordFor(id: string, password: string) {
  const r = await rowById(id);
  return !!r && verifyPassword(password, (JSON.parse(r.secret) as Secret).hash);
}

/** New password; also signs out every other device. Returns the new session version. */
export async function setPassword(id: string, password: string) {
  const r = await rowById(id);
  if (!r) return 0;
  const v = (JSON.parse(r.secret) as Secret).v + 1;
  await writeSecret(id, { hash: await hashPassword(password), v });
  return v;
}

export async function listCustomers(): Promise<Customer[]> {
  const d = await db();
  if (!d) return [...memory.values()].map(toCustomer).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const { results } = await d.prepare("SELECT id, email, data, created FROM customers ORDER BY created DESC LIMIT 2000").all<Row>();
  return results.map(toCustomer);
}

export async function deleteCustomer(id: string) {
  const d = await db();
  if (!d) {
    for (const [k, r] of memory) if (r.id === id) memory.delete(k);
    return;
  }
  await d.prepare("DELETE FROM customers WHERE id = ?").bind(id).run();
}

// ───────── Sessions ─────────
/** A random signing key created on first use and kept in D1, so nothing needs configuring. */
let secretCache: string | null = null;
async function signingKey() {
  if (secretCache) return secretCache;
  const d = await db();
  if (!d) return (memorySecret ||= b64(crypto.getRandomValues(new Uint8Array(32))));
  await d.prepare("INSERT OR IGNORE INTO auth (key, value) VALUES ('customer-sessions', ?)").bind(b64(crypto.getRandomValues(new Uint8Array(32)))).run();
  const row = await d.prepare("SELECT value FROM auth WHERE key = 'customer-sessions'").first<{ value: string }>();
  return (secretCache = row!.value);
}
async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(await signingKey()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
}

/** Signs the browser in. Without "remember me" the cookie ends with the browser session (and within a day). */
export async function startSession(id: string, remember = true) {
  const r = await rowById(id);
  if (!r) return;
  const v = (JSON.parse(r.secret) as Secret).v;
  const payload = `${id}.${Math.floor(Date.now() / 1000) + (remember ? TTL : 86400)}.${v}`;
  (await cookies()).set(COOKIE, `${payload}.${await sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: TTL } : {}),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in customer, or null. */
export async function currentCustomer(): Promise<Customer | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  const payload = raw.slice(0, i);
  const [id, exp, v] = payload.split(".");
  if (!id || Number(exp) < Date.now() / 1000) return null;
  const good = await sign(payload);
  if (good.length !== raw.length - i - 1 || good !== raw.slice(i + 1)) return null;
  try {
    const r = await rowById(id);
    if (!r || (JSON.parse(r.secret) as Secret).v !== Number(v)) return null;
    return toCustomer(r);
  } catch {
    return null;
  }
}

export const accountInfo = (c: Customer): AccountInfo => {
  const { createdAt: _c, lastLogin: _l, ...info } = c;
  return info;
};

// ───────── Admin ─────────
export async function getCustomer(id: string) {
  const r = await rowById(id);
  return r ? toCustomer(r) : null;
}

/** Change the sign-in email; false if another account already uses it. */
export async function changeEmail(id: string, email: string) {
  const e = normEmail(email);
  const d = await db();
  if (!d) {
    if (memory.has(e)) return memory.get(e)!.id === id;
    const r = [...memory.entries()].find(([, x]) => x.id === id);
    if (!r) return false;
    memory.delete(r[0]);
    memory.set(e, { ...r[1], email: e });
    return true;
  }
  try {
    await d.prepare("UPDATE customers SET email = ? WHERE id = ?").bind(e, id).run();
    return true;
  } catch {
    return false; // UNIQUE constraint
  }
}

/** Invalidate every session of this customer. */
export async function signOutEverywhere(id: string) {
  const r = await rowById(id);
  if (!r) return;
  const s = JSON.parse(r.secret) as Secret;
  await writeSecret(id, { ...s, v: s.v + 1 });
}

// ───────── Password reset links ─────────
const RESET_TTL = 60 * 60; // 1 hour
const resetMemory = new Map<string, { customer: string; expires: number }>();
const sha = async (t: string) => b64(await crypto.subtle.digest("SHA-256", enc.encode(t)));

export async function findCustomerByEmail(email: string) {
  const r = await rowByEmail(email);
  return r ? toCustomer(r) : null;
}

/** A fresh single-use token for this customer (older ones stop working). */
export async function createResetToken(customerId: string) {
  const token = b64(crypto.getRandomValues(new Uint8Array(32)));
  const hash = await sha(token);
  const expires = Math.floor(Date.now() / 1000) + RESET_TTL;
  const d = await db();
  if (!d) {
    for (const [k, v] of resetMemory) if (v.customer === customerId) resetMemory.delete(k);
    resetMemory.set(hash, { customer: customerId, expires });
    return token;
  }
  await d.batch([
    d.prepare("DELETE FROM resets WHERE customer = ? OR expires < ?").bind(customerId, Math.floor(Date.now() / 1000)),
    d.prepare("INSERT INTO resets (hash, customer, expires) VALUES (?, ?, ?)").bind(hash, customerId, expires),
  ]);
  return token;
}

/** The customer a still-valid token belongs to; `consume` makes it unusable afterwards. */
export async function checkResetToken(token: string, consume = false): Promise<string | null> {
  if (!/^[\w-]{30,60}$/.test(token)) return null;
  const hash = await sha(token);
  const now = Math.floor(Date.now() / 1000);
  const d = await db();
  if (!d) {
    const r = resetMemory.get(hash);
    if (!r || r.expires < now) return null;
    if (consume) resetMemory.delete(hash);
    return r.customer;
  }
  const r = await d.prepare("SELECT customer FROM resets WHERE hash = ? AND expires >= ?").bind(hash, now).first<{ customer: string }>();
  if (!r) return null;
  if (consume) await d.prepare("DELETE FROM resets WHERE customer = ?").bind(r.customer).run();
  return r.customer;
}
