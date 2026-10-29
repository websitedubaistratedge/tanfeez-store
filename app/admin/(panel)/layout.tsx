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
    <div dir="ltr" lang="en" className="min-h-dvh bg-[#F7F6F4] lg:flex">
      <Sidebar badges={badges} />
      <main className="mx-auto min-w-0 max-w-[1400px] flex-1 px-4 pb-16 pt-20 md:px-8 lg:px-10 lg:pt-10">{children}</main>
    </div>
  );
}
