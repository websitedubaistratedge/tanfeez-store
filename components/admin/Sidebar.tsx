"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Package, Layers, FolderKanban, ShoppingCart, ClipboardList, Inbox, Settings, LogOut, ExternalLink, Menu, X, Sparkles, Palette } from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/lib/admin-actions";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart, badge: "orders" },
  { href: "/admin/requests", label: "Quote requests", Icon: ClipboardList, badge: "requests" },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/fabrics", label: "Fabrics & finishes", Icon: Palette },
  { href: "/admin/categories", label: "Categories", Icon: Layers },
  { href: "/admin/inspiration", label: "Inspiration", Icon: Sparkles },
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
        <Logo />
        <span className="mt-2 block font-serif text-[1.05rem] leading-none text-ink-2">Back office</span>
      </Link>
      <ul className="space-y-1">
        {NAV.map(({ href, label, Icon, ...rest }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          const count = "badge" in rest ? badges[rest.badge] : 0;
          return (
            <li key={href} className="relative">
              {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-full bg-plate" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <Link href={href} className={clsx("relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.9rem] transition", active ? "font-medium text-ink" : "text-ink/55 hover:text-ink")}>
                <Icon className="h-[18px] w-[18px] stroke-[1.6]" />
                {label}
                {count > 0 && (
                  <span className="ms-auto flex items-center gap-1.5 text-[0.75rem] font-medium tabular-nums text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.9rem] text-ink/55 hover:text-ink">
          <ExternalLink className="h-[18px] w-[18px] stroke-[1.6]" /> View website
        </Link>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.9rem] text-ink/55 hover:text-ink">
            <LogOut className="h-[18px] w-[18px] stroke-[1.6]" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 border-e border-line bg-white p-4 lg:block">{nav}</aside>
      <div className="no-print fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full p-2 text-ink" aria-label="Menu">
          {Object.values(badges).some(Boolean) && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
          <Menu className="h-5 w-5 stroke-[1.6]" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="absolute inset-y-0 left-0 w-72 bg-white p-4" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-full p-2 text-ink hover:bg-plate" aria-label="Close"><X className="h-5 w-5 stroke-[1.6]" /></button>
              {nav}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
