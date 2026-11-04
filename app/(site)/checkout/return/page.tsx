import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readDB } from "@/lib/db";
import { syncPayment } from "@/lib/payments";
import { PaymentReturn } from "@/components/shop/PaymentReturn";

export const metadata: Metadata = { title: "Payment", robots: { index: false }, referrer: "no-referrer" };

// Where Tabby, Tamara and Ziina send the customer back. The query string only says which order;
// the outcome always comes from asking the provider (syncPayment).
export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<{ o?: string; r?: string }> }) {
  const { o = "", r = "" } = await searchParams;
  let order = (await readDB()).orders.find((x) => x.id === o);
  if (!order?.gateway) redirect("/checkout");
  try {
    await syncPayment(order.id);
    order = (await readDB()).orders.find((x) => x.id === o) ?? order;
  } catch (e) {
    console.error("[payments] return", e);
  }
  const g = order.gateway!;
  return <PaymentReturn number={order.number} state={g.state} provider={g.provider} hint={r === "cancel" ? "cancel" : r === "failure" ? "failure" : "success"} />;
}
