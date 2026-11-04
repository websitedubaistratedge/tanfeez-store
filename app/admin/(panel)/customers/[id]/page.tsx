import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/customers";
import { readDB } from "@/lib/db";
import { CustomerDetail } from "@/components/admin/CustomerDetail";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, db] = await Promise.all([getCustomer(id), readDB()]);
  if (!customer) notFound();
  return <CustomerDetail customer={customer} orders={db.orders.filter((o) => o.customerId === id)} />;
}
