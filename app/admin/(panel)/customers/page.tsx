import { listCustomers } from "@/lib/customers";
import { readDB } from "@/lib/db";
import { CustomersTable } from "@/components/admin/CustomersTable";

export const metadata = { title: "Customers" };

export default async function CustomersAdmin() {
  const [customers, db] = await Promise.all([listCustomers(), readDB()]);
  const stats: Record<string, { orders: number; spent: number }> = {};
  for (const o of db.orders) {
    if (!o.customerId) continue;
    const s = (stats[o.customerId] ??= { orders: 0, spent: 0 });
    s.orders++;
    if (o.status !== "cancelled") s.spent += o.total;
  }
  return <CustomersTable customers={customers} stats={stats} />;
}
