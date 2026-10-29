"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutGrid, Menu, ShoppingBag, Sparkles } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { cartCount, useCart, useHydrated, useUI } from "@/lib/store";

/** Phone/tablet tab bar: the shop is always one thumb-tap away. */
export function MobileTabBar() {
  const { lang } = useSite();
  const ar = lang === "ar";
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const { setCart, setMenu, cartOpen, menuOpen } = useUI();
  const count = hydrated ? cartCount(items) : 0;
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null;

  const tabs = [
    { id: "home", href: "/", label: ar ? "الرئيسية" : "Home", Icon: Home, on: pathname === "/" },
    { id: "shop", href: "/shop", label: ar ? "المتجر" : "Shop", Icon: LayoutGrid, on: pathname.startsWith("/shop") },
    { id: "rooms", href: "/inspiration", label: ar ? "الغرف" : "Rooms", Icon: Sparkles, on: pathname.startsWith("/inspiration") },
  ];
  const cls = (on: boolean) =>
    clsx("relative flex flex-1 flex-col items-center justify-center gap-1 pt-2 text-[0.66rem] font-medium transition-colors", on ? "text-ink" : "text-ink/45");
  const dot = <motion.span layoutId="tab-dot" className="absolute top-0 h-[2px] w-6 rounded-full bg-brand" transition={{ type: "spring", stiffness: 500, damping: 36 }} />;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl no-print lg:hidden" aria-label={ar ? "التنقل" : "Navigation"}>
        <div className="mx-auto flex h-[58px] max-w-md">
          {tabs.map(({ id, href, label, Icon, on }) => (
            <Link key={id} href={href} className={cls(on && !cartOpen && !menuOpen)}>
              {on && !cartOpen && !menuOpen && dot}
              <Icon className="h-[19px] w-[19px] stroke-[1.6]" />
              {label}
            </Link>
          ))}
          <button onClick={() => setCart(true)} className={cls(cartOpen)}>
            {cartOpen && dot}
            <span className="relative">
              <ShoppingBag className="h-[19px] w-[19px] stroke-[1.6]" />
              {count > 0 && (
                <motion.span key={count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -end-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold text-ink">
                  {count}
                </motion.span>
              )}
            </span>
            {ar ? "الحقيبة" : "Bag"}
          </button>
          <button onClick={() => setMenu(true)} className={cls(menuOpen)}>
            {menuOpen && dot}
            <Menu className="h-[19px] w-[19px] stroke-[1.6]" />
            {ar ? "القائمة" : "Menu"}
          </button>
        </div>
      </nav>
      {/* keeps the footer clear of the bar */}
      <div className="h-[calc(58px+env(safe-area-inset-bottom))] bg-band lg:hidden" aria-hidden />
    </>
  );
}
