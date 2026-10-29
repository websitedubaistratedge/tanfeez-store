import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "tz_admin";
const TTL = 60 * 60 * 24 * 7; // 7 days

const secret = () => process.env.SESSION_SECRET || "dev-secret-change-me";
const sign = (v: string) =>
  crypto.createHmac("sha256", secret()).update(v).digest("base64url");

export function checkPassword(pw: string) {
  const expected = process.env.ADMIN_PASSWORD || "tanfeez-admin";
  const a = Buffer.from(pw);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function createSession() {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const payload = `admin.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  const payload = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  const good = sign(payload);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good)))
    return false;
  const exp = Number(payload.split(".")[1]);
  return exp > Date.now() / 1000;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
