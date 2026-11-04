import { readDB } from "@/lib/db";
import { syncStalePayments } from "@/lib/payments";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default async function OrdersAdmin() {
  // Orders left on a payment page get re-checked with the provider.
  await syncStalePayments().catch(() => {});
  const db = await readDB();
  return <OrdersTable orders={db.orders} />;
}
