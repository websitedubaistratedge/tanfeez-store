"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { uploadStore } from "./uploads";
import { authenticate, checkPasswordFor, checkResetToken, createCustomer, createResetToken, currentCustomer, deleteCustomer, endSession, findCustomerByEmail, normEmail, saveCustomer, setPassword, startSession } from "./customers";
import { customerEmailReady, origin, sendPasswordReset } from "./notify";
import type { Customer } from "./types";
import { LEGAL_UPDATED } from "./legal";

// Customer sign-up, sign-in and the "My account" forms. Errors come back as short codes
// the forms translate (see components/account).

export type AccountResult = { ok: true } | { ok: false; error: string };

const clean = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const validEmail = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const MIN_PASSWORD = 8;

// After MAX_TRIES wrong passwords from one connection, sign-in pauses for LOCK_SECONDS (as in the admin),
// and one connection can open at most MAX_SIGNUPS accounts an hour. Counters live in Workers KV; the free
// plan allows ~1,000 writes a day, so we only write on failures, and a KV hiccup never blocks a customer.
const MAX_TRIES = 8;
const LOCK_SECONDS = 15 * 60;
const MAX_SIGNUPS = 5;
async function limiter(kind: "fails" | "signups" | "resets", max: number, ttl: number) {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const kv = await uploadStore().catch(() => null);
  const key = `account-${kind}:${ip}`;
  let count = 0;
  try {
    count = Number((await kv?.get(key)) ?? 0);
  } catch {}
  return {
    blocked: count >= max,
    hit: async () => {
      try {
        await kv?.put(key, String(count + 1), { expirationTtl: ttl });
      } catch {}
    },
    clear: async () => {
      if (!count) return;
      try {
        await kv?.delete(key);
      } catch {}
    },
  };
}

export async function signUp(fd: FormData): Promise<AccountResult> {
  const kind = fd.get("kind") === "company" ? "company" : "private";
  const firstName = clean(fd.get("firstName"), 80);
  const lastName = clean(fd.get("lastName"), 80);
  const email = normEmail(clean(fd.get("email"), 160));
  const password = String(fd.get("password") ?? "");
  const company = clean(fd.get("company"), 120);
  if (!firstName || !lastName) return { ok: false, error: "name" };
  if (!validEmail(email)) return { ok: false, error: "email" };
  if (kind === "company" && !company) return { ok: false, error: "company" };
  if (password.length < MIN_PASSWORD || password.length > 200) return { ok: false, error: "short" };
  if (password !== String(fd.get("confirm") ?? "")) return { ok: false, error: "match" };
  if (!fd.get("terms")) return { ok: false, error: "terms" };
  const limit = await limiter("signups", MAX_SIGNUPS, 60 * 60);
  if (limit.blocked) return { ok: false, error: "locked" };

  const c = await createCustomer(
    {
      kind,
      firstName,
      lastName,
      company: kind === "company" ? company : undefined,
      email,
      phone: clean(fd.get("phone"), 40),
      emirate: "Dubai",
      area: "",
      address: "",
      marketing: !!fd.get("marketing"),
      marketingAt: new Date().toISOString(),
      termsAccepted: { at: new Date().toISOString(), version: LEGAL_UPDATED },
      lastLogin: new Date().toISOString(),
    },
    password
  );
  if (c === "exists") return { ok: false, error: "exists" };
  await limit.hit();
  await startSession(c.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signIn(fd: FormData): Promise<AccountResult> {
  const t = await limiter("fails", MAX_TRIES, LOCK_SECONDS);
  if (t.blocked) return { ok: false, error: "locked" };
  const c = await authenticate(clean(fd.get("email"), 160), String(fd.get("password") ?? ""));
  if (!c) {
    await t.hit();
    return { ok: false, error: "wrong" };
  }
  await t.clear();
  await saveCustomer({ ...c, lastLogin: new Date().toISOString() });
  await startSession(c.id, !!fd.get("remember"));
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut() {
  await endSession();
  revalidatePath("/", "layout");
}

export async function updateProfile(fd: FormData): Promise<AccountResult> {
  const c = await currentCustomer();
  if (!c) return { ok: false, error: "signedOut" };
  const next: Customer = {
    ...c,
    kind: fd.get("kind") === "company" ? "company" : "private",
    firstName: clean(fd.get("firstName"), 80) || c.firstName,
    lastName: clean(fd.get("lastName"), 80) || c.lastName,
    company: clean(fd.get("company"), 120) || undefined,
    phone: clean(fd.get("phone"), 40),
    emirate: clean(fd.get("emirate"), 40) || "Dubai",
    area: clean(fd.get("area"), 120),
    address: clean(fd.get("address"), 300),
    marketing: !!fd.get("marketing"),
    marketingAt: !!fd.get("marketing") !== c.marketing ? new Date().toISOString() : c.marketingAt,
  };
  await saveCustomer(next);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changePassword(fd: FormData): Promise<AccountResult> {
  const c = await currentCustomer();
  if (!c) return { ok: false, error: "signedOut" };
  const t = await limiter("fails", MAX_TRIES, LOCK_SECONDS);
  if (t.blocked) return { ok: false, error: "locked" };
  const next = String(fd.get("password") ?? "");
  if (!(await checkPasswordFor(c.id, String(fd.get("current") ?? "")))) {
    await t.hit();
    return { ok: false, error: "current" };
  }
  if (next.length < MIN_PASSWORD || next.length > 200) return { ok: false, error: "short" };
  if (next !== String(fd.get("confirm") ?? "")) return { ok: false, error: "match" };
  await setPassword(c.id, next);
  await startSession(c.id); // keep this device signed in; every other one is signed out
  return { ok: true };
}

// ───────── Forgot password ─────────
/**
 * Emails a one-hour reset link if the address has an account. The answer is the same either
 * way, so the form can't be used to find out who has an account. Without email set up yet,
 * the customer is pointed to WhatsApp, where the team can issue a temporary password.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true; via: "email" | "whatsapp" } | { ok: false; error: string }> {
  const e = normEmail(clean(email, 160));
  if (!validEmail(e)) return { ok: false, error: "email" };
  if (!(await customerEmailReady())) return { ok: true, via: "whatsapp" };
  const limit = await limiter("resets", 5, 60 * 60);
  if (limit.blocked) return { ok: false, error: "locked" };
  await limit.hit();
  const c = await findCustomerByEmail(e);
  if (c) {
    try {
      const token = await createResetToken(c.id);
      await sendPasswordReset(c.email, c.firstName, `${await origin()}/reset?token=${token}`);
    } catch (err) {
      console.error("[reset]", err);
    }
  }
  return { ok: true, via: "email" };
}

export async function resetPassword(fd: FormData): Promise<AccountResult> {
  const token = clean(fd.get("token"), 100);
  const next = String(fd.get("password") ?? "");
  if (next.length < MIN_PASSWORD || next.length > 200) return { ok: false, error: "short" };
  if (next !== String(fd.get("confirm") ?? "")) return { ok: false, error: "match" };
  const id = await checkResetToken(token, true);
  if (!id) return { ok: false, error: "expired" };
  await setPassword(id, next); // also signs out every other device
  await startSession(id);
  revalidatePath("/", "layout");
  return { ok: true };
}

// ───────── Delete my account ─────────
export async function deleteMyAccount(fd: FormData): Promise<AccountResult> {
  const c = await currentCustomer();
  if (!c) return { ok: false, error: "signedOut" };
  const t = await limiter("fails", MAX_TRIES, LOCK_SECONDS);
  if (t.blocked) return { ok: false, error: "locked" };
  if (!(await checkPasswordFor(c.id, String(fd.get("password") ?? "")))) {
    await t.hit();
    return { ok: false, error: "current" };
  }
  await deleteCustomer(c.id); // orders stay on file, as UAE tax law requires
  await endSession();
  revalidatePath("/", "layout");
  return { ok: true };
}
