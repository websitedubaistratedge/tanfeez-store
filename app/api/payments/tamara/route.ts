import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { findOrderByRef, syncPayment, verifyTamaraJwt } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Tamara order notifications. Each carries a JWT (tamaraToken query parameter or Bearer header)
// signed with our notification token; the order status is then re-read from Tamara's API.
export async function POST(req: Request) {
  const { settings } = await readDB();
  const secret = settings.payments?.tamara.notificationToken ?? "";
  const token = new URL(req.url).searchParams.get("tamaraToken") || (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!(await verifyTamaraJwt(token, secret))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { order_id?: string };
  if (!body.order_id) return NextResponse.json({ ok: true });
  const order = await findOrderByRef("tamara", body.order_id);
  if (!order) return NextResponse.json({ error: "unknown order" }, { status: 404 });
  try {
    await syncPayment(order.id);
  } catch (e) {
    console.error("[payments] tamara webhook", e);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
