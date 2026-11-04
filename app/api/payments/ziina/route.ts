import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { findOrderByRef, syncPayment, verifyZiina } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Ziina payment updates, signed with X-Hmac-Signature (HMAC-SHA256 of the body). The status
// is then re-read from Ziina's API.
export async function POST(req: Request) {
  const { settings } = await readDB();
  const secret = settings.payments?.ziina.webhookSecret ?? "";
  const raw = await req.text();
  if (!secret || !(await verifyZiina(raw, req.headers.get("x-hmac-signature") ?? "", secret))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { event?: string; data?: { id?: string } } = {};
  try {
    body = JSON.parse(raw);
  } catch {}
  if (body.event !== "payment_intent.status.updated" || !body.data?.id) return NextResponse.json({ ok: true });
  const order = await findOrderByRef("ziina", body.data.id);
  if (!order) return NextResponse.json({ error: "unknown payment" }, { status: 404 });
  try {
    await syncPayment(order.id);
  } catch (e) {
    console.error("[payments] ziina webhook", e);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
