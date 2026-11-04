import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { findOrderByRef, sameText, syncPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Tabby payment updates. Tabby sends back the header we registered (X-Tanfeez-Key); the
// payload itself is never trusted — we re-read the payment from Tabby's API.
export async function POST(req: Request) {
  const { settings } = await readDB();
  const secret = settings.payments?.tabby.webhookSecret ?? "";
  if (!secret || !sameText(req.headers.get("x-tanfeez-key") ?? "", secret)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ ok: true });
  const order = await findOrderByRef("tabby", body.id);
  if (!order) return NextResponse.json({ error: "unknown payment" }, { status: 404 }); // Tabby retries; the order may still be saving
  try {
    await syncPayment(order.id);
  } catch (e) {
    console.error("[payments] tabby webhook", e);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
