import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountView } from "@/components/account/AccountView";
import { accountInfo, currentCustomer } from "@/lib/customers";
import { readDB } from "@/lib/db";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const me = await currentCustomer();
  if (!me) redirect("/login?next=/account");
  const db = await readDB();
  const orders = db.orders
    .filter((o) => o.customerId === me.id)
    .map((o) => ({ number: o.number, createdAt: o.createdAt, status: o.status, total: o.total, items: o.items.map((i) => ({ name: i.name, qty: i.qty, image: i.image })) }));
  return <AccountView key={tab ?? "orders"} me={accountInfo(me)} since={me.createdAt} orders={orders} initial={tab === "details" || tab === "password" ? tab : "orders"} />;
}
