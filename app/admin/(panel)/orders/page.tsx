import { readDB } from "@/lib/db";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default async function OrdersAdmin() {
  const db = await readDB();
  return <OrdersTable orders={db.orders} />;
}
