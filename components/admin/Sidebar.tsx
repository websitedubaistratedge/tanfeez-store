"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Package, Layers, FolderKanban, ShoppingCart, ClipboardList, Inbox, Settings, LogOut, ExternalLink, Menu, X } from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/lib/admin-actions";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart, badge: "orders" },
  { href: "/admin/requests", label: "Quote requests", Icon: ClipboardList, badge: "requests" },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: Layers },
  { href: "/admin/projects", label: "Projects", Icon: FolderKanban },
  { href: "/admin/messages", label: "Messages", Icon: Inbox, badge: "messages" },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
] as const;

export function Sidebar({ badges }: { badges: Record<"orders" | "requests" | "messages", number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav className="flex h-full flex-col">
      <Link href="/admin" className="px-3 pb-8 pt-2">
        <Logo light />
        <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Admin</span>
      </Link>
      <ul className="space-y-1">
        {NAV.map(({ href, label, Icon, ...rest }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          const count = "badge" in rest ? badges[rest.badge] : 0;
          return (
            <li key={href} className="relative">
              {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-white/10" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <Link href={href} className={clsx("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "text-white" : "text-white/60 hover:text-white")}>
                <Icon className={clsx("h-[18px] w-[18px]", active && "text-brand")} />
                {label}
                {count > 0 && <span className="ms-auto rounded-full bg-brand px-2 py-0.5 text-[11px] font-black text-ink">{count}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" /> View website
        </Link>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 hover:text-white">
            <LogOut className="h-[18px] w-[18px]" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 bg-ink-950 p-4 lg:block">{nav}</aside>
      <div className="no-print fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-ink-950 px-4 lg:hidden">
        <Logo light />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-white" aria-label="Menu"><Menu className="h-5 w-5" /></button>
      </div>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="absolute inset-y-0 left-0 w-72 bg-ink-950 p-4" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-lg p-2 text-white" aria-label="Close"><X className="h-5 w-5" /></button>
              {nav}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
