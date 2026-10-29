import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · TANFEEZ Admin" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const db = await readDB();
  const badges = {
    orders: db.orders.filter((o) => o.status === "new").length,
    requests: db.requests.filter((r) => r.status === "new").length,
    messages: db.messages.filter((m) => !m.read).length,
  };
  return (
    <div dir="ltr" lang="en" className="min-h-dvh bg-sand lg:flex">
      <Sidebar badges={badges} />
      <main className="min-w-0 flex-1 px-4 pb-16 pt-20 md:px-8 lg:pt-8">{children}</main>
    </div>
  );
}
