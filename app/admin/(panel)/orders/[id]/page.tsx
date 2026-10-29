import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { OrderDetail } from "@/components/admin/OrderDetail";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const order = db.orders.find((o) => o.id === id);
  if (!order) notFound();
  return <OrderDetail order={order} bank={db.settings.bank} />;
}
