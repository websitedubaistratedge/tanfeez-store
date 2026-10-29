"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState, useTransition, useId } from "react";
import { Heart, MapPin, Menu, Search, ShoppingBag, X, Phone } from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/ui/Logo";
import { EASE } from "@/components/ui/motion";
import { useSite } from "@/components/providers";
import { cartCount, useCart, useHydrated, useUI, useWishlist } from "@/lib/store";
import { setLang } from "@/lib/actions";
import { lockScroll } from "./SmoothScroll";
import { CircleArrow } from "@/components/ui/buttons";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";

type NavLink = { href: string; en: string; ar: string };
const HOME_LINKS: NavLink[] = [
  { href: "/shop", en: "Shop all", ar: "تسوّق الكل" },
  { href: "/shop?c=sofas", en: "Living", ar: "المعيشة" },
  { href: "/shop?c=beds", en: "Bedroom", ar: "النوم" },
  { href: "/inspiration", en: "Inspiration", ar: "إلهام" },
  { href: "/about", en: "About", ar: "من نحن" },
  { href: "/contact", en: "Contact", ar: "تواصل" },
];
const BUSINESS_LINKS: NavLink[] = [
  { href: "/business", en: "Fit-out", ar: "التجهيز" },
  { href: "/projects", en: "Projects", ar: "المشاريع" },
  { href: "/services", en: "Services", ar: "الخدمات" },
  { href: "/business#process", en: "How we work", ar: "كيف نعمل" },
  { href: "/contact", en: "Contact", ar: "تواصل" },
];
export const isBusinessPath = (p: string) => /^\/(business|projects|services)/.test(p);

/** The Home / Business switch: a sliding pill between two worlds. */
export function ModeSwitch({ className }: { className?: string }) {
  const { lang } = useSite();
  const pathname = usePathname();
  const biz = isBusinessPath(pathname);
  const pill = `mode-pill-${useId()}`; // the switch appears in several places; each needs its own pill
  const items = [
    { href: "/", on: !biz, label: lang === "ar" ? "أثاث المنزل" : "Home furniture" },
    { href: "/business", on: biz, label: lang === "ar" ? "للأعمال" : "For business" },
  ];
  return (
    <div className={clsx("relative inline-flex rounded-full bg-plate p-1 text-[0.8rem]", className)}>
      {items.map((it) => (
        <Link key={it.href} href={it.href} className={clsx("relative z-10 rounded-full px-3.5 py-1.5 transition-colors duration-300", it.on ? "text-white" : "text-ink/60 hover:text-ink")}>
          {it.on && <motion.span layoutId={pill} className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          {it.label}
        </Link>
      ))}
    </div>
  );
}

const CATS = [
  { slug: "sofas", en: "Sofas & lounge", ar: "الكنب والجلسات" },
  { slug: "armchairs", en: "Armchairs", ar: "الكراسي المنفردة" },
  { slug: "beds", en: "Beds", ar: "الأسرّة" },
  { slug: "media", en: "TV & media walls", ar: "جدران التلفاز" },
  { slug: "storage", en: "Wardrobes & storage", ar: "الخزائن" },
  { slug: "tables", en: "Tables & vanities", ar: "الطاولات والتسريحات" },
  { slug: "joinery", en: "Stairs, doors & joinery", ar: "السلالم والأبواب والنجارة" },
  { slug: "commercial", en: "Retail & commercial", ar: "التجاري" },
];

export function LangToggle({ className }: { className?: string }) {
  const { lang, t } = useSite();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(async () => {
          await setLang(lang === "en" ? "ar" : "en");
          router.refresh();
        })
      }
      className={clsx("text-[0.85rem] transition-opacity hover:opacity-60", pending && "opacity-40", className)}
      aria-label="Switch language"
    >
      <span className={lang === "en" ? "font-[family-name:var(--font-plex-ar)]" : ""}>{t("common.lang")}</span>
    </button>
  );
}

function SearchField({ compact = false }: { compact?: boolean }) {
  const { t } = useSite();
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
      }}
      className={clsx("group relative flex items-center border-b border-ink/30 transition-colors focus-within:border-ink", compact ? "w-52" : "w-72")}
    >
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("v2.search")} className="h-9 w-full bg-transparent pe-7 text-[0.9rem] outline-none placeholder:text-ink/45" />
      <button className="absolute end-0" aria-label="Search">
        <Search className="h-[18px] w-[18px] stroke-[1.5]" />
      </button>
    </form>
  );
}

export function Header() {
  const { t, lang, settings } = useSite();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const items = useCart((s) => s.items);
  const wish = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const { setCart, menuOpen, setMenu } = useUI();
  const count = hydrated ? cartCount(items) : 0;
  const biz = isBusinessPath(pathname);
  const LINKS = biz ? BUSINESS_LINKS : HOME_LINKS;
  const label = (l: NavLink) => (lang === "ar" ? l.ar : l.en);
  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (query) return false;
    return path === "/" ? pathname === "/" : pathname === path || (path !== "/business" && pathname.startsWith(path + "/"));
  };

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setCollapsed(y > 60);
    setHidden(y > 500 && y > prev + 2 && !menuOpen);
    if (y < prev - 2) setHidden(false);
  });
  useEffect(() => setMenu(false), [pathname, setMenu]);
  useEffect(() => lockScroll(menuOpen), [menuOpen]);

  if (pathname.startsWith("/admin")) return null;

  const Icons = (
    <div className="flex items-center gap-1">
      <Link href="/shop?w=1" className="relative hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-plate sm:flex" aria-label="Wishlist">
        <Heart className="h-[19px] w-[19px] stroke-[1.5]" />
        {hydrated && wish.length > 0 && <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-brand" />}
      </Link>
      <button onClick={() => setCart(true)} className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-plate" aria-label={t("v2.bag")}>
        <ShoppingBag className="h-[19px] w-[19px] stroke-[1.5]" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0 }}
              animate={{ scale: [1.4, 1] }}
              exit={{ scale: 0 }}
              className="absolute end-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );

  return (
    <>
      <motion.header
        className={clsx("sticky top-0 z-50 bg-white/90 backdrop-blur-xl transition-[box-shadow] duration-500 no-print", collapsed && "shadow-[0_1px_0_var(--color-line)]")}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          {/* Row 1: utility, centred logo, bag */}
          <div className={clsx("grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-500", collapsed ? "h-[60px]" : "h-[68px] md:h-[76px]")}>
            <div className="flex items-center gap-1">
              <button onClick={() => setMenu(true)} className="-ms-2 flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-plate lg:hidden" aria-label={t("v2.menu")}>
                <Menu className="h-5 w-5 stroke-[1.5]" />
              </button>
              <AnimatePresence mode="wait" initial={false}>
                {collapsed ? (
                  <motion.nav key="links" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.3 }} className="hidden items-center gap-7 lg:flex">
                    {LINKS.slice(0, 4).map((l) => (
                      <Link key={l.href} href={l.href} className={clsx("link-u text-[0.92rem]", isActive(l.href) && "bg-[length:100%_1px]")}>
                        {label(l)}
                      </Link>
                    ))}
                  </motion.nav>
                ) : (
                  <motion.div key="mode" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.3 }} className="hidden lg:block">
                    <ModeSwitch />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/" aria-label="TANFEEZ home" className="justify-self-center">
              <Logo />
            </Link>

            <div className="flex items-center justify-end gap-3">
              <div className="hidden lg:block">
                <AnimatePresence initial={false}>{collapsed && <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden"><SearchField compact /></motion.div>}</AnimatePresence>
              </div>
              <LangToggle className="hidden sm:block" />
              {Icons}
            </div>
          </div>

          {/* Row 2: navigation + search (collapses on scroll) */}
          <motion.div
            initial={false}
            animate={{ height: collapsed ? 0 : 52, opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="hidden overflow-hidden lg:block"
          >
            <div className="flex h-[52px] items-start justify-between">
              <nav className="flex items-center gap-8">
                <button onClick={() => setMenu(true)} className="-ms-1 flex h-8 w-8 items-center justify-center" aria-label={t("v2.menu")}>
                  <Menu className="h-5 w-5 stroke-[1.5]" />
                </button>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={biz ? "biz" : "home"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="flex items-center gap-8">
                    {LINKS.map((l) => (
                      <Link key={l.href} href={l.href} className={clsx("link-u pb-0.5 text-[0.95rem]", isActive(l.href) && "bg-[length:100%_1px]")}>
                        {label(l)}
                      </Link>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </nav>
              {biz ? (
                <Link href="/quote?service=fitout" className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-5 text-[0.85rem] font-medium text-white transition hover:bg-ink-2">
                  {lang === "ar" ? "اطلب عرضاً" : "Request a proposal"} <CircleArrow className="h-4 w-4" />
                </Link>
              ) : (
                <SearchField />
              )}
            </div>
          </motion.div>

          {/* Mobile / tablet: the Home | Business switch gets its own slim row */}
          <motion.div
            initial={false}
            animate={{ height: collapsed ? 0 : 46, opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden lg:hidden"
          >
            <div className="flex h-[46px] items-start justify-center">
              <ModeSwitch className="w-full max-w-sm [&>a]:flex-1 [&>a]:text-center" />
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Drawer menu */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[60] no-print" role="dialog" aria-modal>
            <motion.div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.aside
              className="absolute inset-y-0 start-0 flex w-full max-w-[440px] flex-col bg-white"
              initial={{ x: lang === "ar" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: lang === "ar" ? "100%" : "-100%" }}
              transition={{ duration: 0.6, ease: EASE }}
              data-lenis-prevent
            >
              <div className="flex h-[68px] items-center justify-between border-b border-line px-6">
                <Logo />
                <button onClick={() => setMenu(false)} className="flex h-10 w-10 items-center justify-center rounded-full transition hover:rotate-90 hover:bg-plate" aria-label={t("common.close")}>
                  <X className="h-5 w-5 stroke-[1.5]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <ModeSwitch className="mb-6" />
                <div className="mb-6 sm:hidden"><SearchField /></div>
                <ul>
                  {[{ href: "/", en: "Home", ar: "الرئيسية" }, ...LINKS, { href: "/track", en: "Track order", ar: "تتبع الطلب" }].map((l, i) => (
                    <motion.li key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: EASE }}>
                      <Link href={l.href} className="group flex items-center justify-between border-b border-line py-4 font-display text-[1.6rem] font-medium tracking-tight">
                        {label(l)}
                        <CircleArrow className="h-6 w-6 text-ink/30 transition group-hover:text-ink" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <p className="mb-3 mt-8 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">{t("nav.shop")}</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {CATS.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/shop?c=${c.slug}`} className="link-u text-[0.95rem] text-ink/80">{lang === "ar" ? c.ar : c.en}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4 border-t border-line px-6 py-5">
                <Link href="/quote" className="flex h-12 items-center justify-center rounded-full bg-ink text-[0.92rem] font-medium text-white">{t("nav.quote")}</Link>
                <div className="flex items-center justify-between text-sm text-muted">
                  <a href={`tel:${settings.mobile.replace(/\s/g, "")}`} className="inline-flex items-center gap-2" dir="ltr"><Phone className="h-4 w-4" />{settings.mobile}</a>
                  <div className="flex items-center gap-3">
                    <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsAppIcon className="h-5 w-5" /></a>
                    <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon className="h-5 w-5" /></a>
                    <LangToggle />
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
