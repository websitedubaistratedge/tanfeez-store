"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState, useTransition, useId } from "react";
import { ArrowLeft, Building2, ChevronRight, Heart, MapPin, Menu, Search, ShoppingBag, Sofa, UserRound, X, Phone } from "lucide-react";
import { ROOMS } from "@/lib/rooms";
import clsx from "clsx";
import { Logo } from "@/components/ui/Logo";
import { EASE } from "@/components/ui/motion";
import { useSite } from "@/components/providers";
import { cartCount, useCart, useHydrated, useUI, useWishlist } from "@/lib/store";
import { setLang } from "@/lib/actions";
import { lockScroll } from "./SmoothScroll";
import { CircleArrow } from "@/components/ui/buttons";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { AccountButton, DrawerSignOut, useLoginHref } from "./AccountButton";

type NavLink = { href: string; en: string; ar: string };
const HOME_LINKS: NavLink[] = [
  { href: "/shop", en: "Shop all", ar: "تسوّق الكل" },
  { href: "/shop?c=living", en: "Living", ar: "المعيشة" },
  { href: "/shop?c=bedroom", en: "Bedroom", ar: "النوم" },
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

/** Phones and tablets: the Home / Business switch as a slim tab strip with a gliding underline. */
function ModeTabs() {
  const { lang } = useSite();
  const pathname = usePathname();
  const biz = isBusinessPath(pathname);
  const line = `mode-line-${useId()}`;
  const items = [
    { href: "/", on: !biz, label: lang === "ar" ? "أثاث المنزل" : "Home furniture", Icon: Sofa },
    { href: "/business", on: biz, label: lang === "ar" ? "للأعمال" : "For business", Icon: Building2 },
  ];
  return (
    <nav className="relative flex h-[42px] border-t border-line" aria-label={lang === "ar" ? "القسم" : "Section"}>
      {items.map(({ href, on, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            "relative flex flex-1 items-center justify-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors duration-300",
            on ? "text-ink" : "text-ink/40 active:text-ink/70"
          )}
        >
          <Icon className="h-[15px] w-[15px] stroke-[1.6]" />
          {label}
          {on && <motion.span layoutId={line} className="absolute inset-x-6 bottom-0 h-[2px] rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
        </Link>
      ))}
      <span className="pointer-events-none absolute start-1/2 my-3 h-[18px] w-px bg-line" aria-hidden />
    </nav>
  );
}

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
];

/** Phone menu: these entries open a list of their categories instead of going straight to a page. */
type SubId = "shop" | "living" | "bedroom";
const SUB_FOR: Record<string, SubId> = { "/shop": "shop", "/shop?c=living": "living", "/shop?c=bedroom": "bedroom" };
const SUBMENUS: Record<SubId, { title: NavLink; links: NavLink[]; all: NavLink }> = {
  shop: {
    title: { href: "/shop", en: "Shop all", ar: "تسوّق الكل" },
    links: CATS.map((c) => ({ href: `/shop?c=${c.slug}`, en: c.en, ar: c.ar })),
    all: { href: "/shop", en: "View all furniture", ar: "عرض كل الأثاث" },
  },
  living: {
    title: { href: "/shop?c=living", en: "Living", ar: "المعيشة" },
    links: ROOMS.living.links,
    all: { href: "/shop?c=living", en: "View all living", ar: "عرض كل قطع المعيشة" },
  },
  bedroom: {
    title: { href: "/shop?c=bedroom", en: "Bedroom", ar: "النوم" },
    links: ROOMS.bedroom.links,
    all: { href: "/shop?c=bedroom", en: "View all bedroom", ar: "عرض كل قطع النوم" },
  },
};

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
  const { t, lang, settings, account } = useSite();
  const loginHref = useLoginHref();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [collapsed, setCollapsed] = useState(false);
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

  // The header never slides away: it only slims to one 60px row, so bars that stick under it never jump.
  useMotionValueEvent(scrollY, "change", (y) => setCollapsed(y > 60));
  useEffect(() => setMenu(false), [pathname, setMenu]);
  const [sub, setSub] = useState<SubId | null>(null);
  useEffect(() => {
    if (!menuOpen) setSub(null);
  }, [menuOpen]);
  useEffect(() => lockScroll(menuOpen), [menuOpen]);

  if (pathname.startsWith("/admin")) return null;

  const Icons = (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <AccountButton />
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
      <header className={clsx("sticky top-0 z-50 bg-white/90 backdrop-blur-xl transition-[box-shadow] duration-500 no-print", collapsed && "shadow-[0_1px_0_var(--color-line)]")}>
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
            animate={{ height: collapsed ? 0 : 42, opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="-mx-5 overflow-hidden md:-mx-10 lg:hidden"
          >
            <ModeTabs />
          </motion.div>
        </div>
      </header>

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
                <AnimatePresence mode="wait" initial={false}>
                  {sub ? (
                    <motion.div key={sub} initial={{ opacity: 0, x: lang === "ar" ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: lang === "ar" ? -24 : 24 }} transition={{ duration: 0.35, ease: EASE }}>
                      <button onClick={() => setSub(null)} className="group -ms-1 mb-2 inline-flex items-center gap-2 py-2 text-[0.92rem] text-ink/70 hover:text-ink">
                        <ArrowLeft className="h-4 w-4 stroke-[1.6] transition group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
                        {lang === "ar" ? "القائمة" : "Back to menu"}
                      </button>
                      <p className="mb-2 font-serif text-[1.35rem] leading-none text-ink-2">{label(SUBMENUS[sub].title)}</p>
                      <ul>
                        {[...SUBMENUS[sub].links, SUBMENUS[sub].all].map((l, i) => (
                          <motion.li key={l.href} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.035, duration: 0.4, ease: EASE }}>
                            <Link
                              href={l.href}
                              onClick={() => setMenu(false)}
                              className="group flex items-center justify-between border-b border-line py-4 font-display text-[1.15rem] font-medium tracking-tight"
                            >
                              {label(l)}
                              <CircleArrow className="h-5 w-5 text-ink/30 transition group-hover:text-ink" />
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : (
                    <motion.ul key="main" initial={{ opacity: 0, x: lang === "ar" ? 24 : -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: lang === "ar" ? 24 : -24 }} transition={{ duration: 0.35, ease: EASE }}>
                      {[{ href: "/", en: "Home", ar: "الرئيسية" }, ...LINKS, { href: "/track", en: "Track order", ar: "تتبع الطلب" }].map((l, i) => {
                        const opens = !biz ? SUB_FOR[l.href] : undefined;
                        const cls = "group flex w-full items-center justify-between border-b border-line py-4 text-start font-display text-[1.15rem] font-medium tracking-tight";
                        return (
                          <motion.li key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: EASE }}>
                            {opens ? (
                              <button onClick={() => setSub(opens)} className={cls} aria-haspopup="true">
                                {label(l)}
                                <span className="me-px flex h-[18px] w-[18px] items-center justify-center rounded-full border border-ink/30 text-ink/40 transition group-hover:border-ink group-hover:text-ink">
                                  <ChevronRight className="h-3 w-3 stroke-[1.8] rtl:rotate-180" />
                                </span>
                              </button>
                            ) : (
                              <Link href={l.href} className={cls}>
                                {label(l)}
                                <CircleArrow className="h-5 w-5 text-ink/30 transition group-hover:text-ink" />
                              </Link>
                            )}
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <div className="space-y-4 border-t border-line px-6 py-5">
                <Link href={account ? "/account" : loginHref} className="flex items-center gap-3 rounded-2xl bg-plate px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[0.8rem] font-semibold text-white">
                    {account ? account.firstName.charAt(0).toUpperCase() : <UserRound className="h-4 w-4 stroke-[1.6]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] font-medium">{account ? (lang === "ar" ? `مرحباً، ${account.firstName}` : `Hello, ${account.firstName}`) : lang === "ar" ? "تسجيل الدخول أو إنشاء حساب" : "Sign in or create an account"}</span>
                    <span className="block truncate text-[0.8rem] text-muted">{account ? (lang === "ar" ? "طلباتي وبياناتي" : "My orders & details") : lang === "ar" ? "تتبّع طلباتك وأتمم الشراء أسرع" : "Track orders, check out faster"}</span>
                  </span>
                  <CircleArrow className="h-5 w-5 text-ink/40" />
                </Link>
                {account && <DrawerSignOut />}
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
