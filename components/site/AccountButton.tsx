"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Loader2, LogOut, Package, UserRound } from "lucide-react";
import { useSite } from "@/components/providers";
import { EASE } from "@/components/ui/motion";
import { signOut } from "@/lib/account-actions";

/** Where "Sign in" should bring the customer back to afterwards. */
export function useLoginHref(mode?: "create") {
  const pathname = usePathname();
  const back = pathname.startsWith("/login") || pathname.startsWith("/account") ? "" : `next=${encodeURIComponent(pathname)}`;
  const q = [mode && `mode=${mode}`, back].filter(Boolean).join("&");
  return `/login${q ? `?${q}` : ""}`;
}

/**
 * The person icon beside the bag. Guests: outline icon → sign in. Signed in: their initial.
 * With a mouse, hovering opens a small menu; on touch, a tap goes straight to the page.
 */
export function AccountButton() {
  const { lang, account } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const login = useLoginHref();
  const create = useLoginHref("create");
  const [open, setOpen] = useState(false);
  const [leaving, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverable = useRef(false);

  useEffect(() => {
    hoverable.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const enter = () => {
    if (!hoverable.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 80);
  };
  const leave = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 180);
  };
  const out = () =>
    start(async () => {
      await signOut();
      setOpen(false);
      if (pathname.startsWith("/account")) router.replace("/");
      router.refresh();
    });

  const initial = account?.firstName.trim().charAt(0).toUpperCase();
  const label = account ? (ar ? "حسابي" : "My account") : ar ? "تسجيل الدخول" : "Sign in";
  const item = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] text-ink-2 transition hover:bg-plate hover:text-ink";

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={leave}>
      <Link href={account ? "/account" : login} aria-label={label} className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-plate">
        {account ? (
          <span className="relative flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ink text-[0.72rem] font-semibold text-white">
            {initial}
            <span className="absolute -bottom-px -end-px h-2 w-2 rounded-full bg-brand ring-[1.5px] ring-white" aria-hidden />
          </span>
        ) : (
          <UserRound className="h-[19px] w-[19px] stroke-[1.5]" />
        )}
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: EASE }}
            className="absolute end-0 top-full z-50 w-[280px] origin-top-right pt-2 rtl:origin-top-left"
          >
            <div className="rounded-2xl border border-line bg-white p-2 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.25)]">
              {account ? (
                <>
                  <div className="px-3 pb-3 pt-2">
                    <p className="font-display text-[1.05rem] font-semibold">{ar ? `مرحباً، ${account.firstName}` : `Hello, ${account.firstName}`}</p>
                    <p className="truncate text-[0.8rem] text-muted" dir="ltr">{account.email}</p>
                  </div>
                  <div className="border-t border-line pt-1.5">
                    <Link href="/account" className={item}><Package className="h-4 w-4 stroke-[1.6]" />{ar ? "طلباتي" : "My orders"}</Link>
                    <Link href="/account?tab=details" className={item}><UserRound className="h-4 w-4 stroke-[1.6]" />{ar ? "بياناتي والعنوان" : "Details & address"}</Link>
                    <Link href="/account?tab=password" className={item}><KeyRound className="h-4 w-4 stroke-[1.6]" />{ar ? "كلمة المرور" : "Password"}</Link>
                    <button onClick={out} disabled={leaving} className={`${item} w-full`}>
                      {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 stroke-[1.6] rtl:-scale-x-100" />}
                      {ar ? "تسجيل الخروج" : "Sign out"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-3">
                  <p className="font-display text-[1.05rem] font-semibold">{ar ? "حسابك في تنفيذ" : "Your TANFEEZ account"}</p>
                  <p className="mt-1 text-[0.82rem] leading-snug text-muted">{ar ? "تتبّع طلباتك واحفظ عنوانك لإتمام شراء أسرع." : "Track your orders and save your address for a faster checkout."}</p>
                  <Link href={login} className="mt-4 flex h-11 items-center justify-center rounded-full bg-ink text-[0.88rem] font-medium text-white transition hover:bg-ink-2">
                    {ar ? "تسجيل الدخول" : "Sign in"}
                  </Link>
                  <Link href={create} className="mt-2 flex h-11 items-center justify-center rounded-full border border-ink/20 text-[0.88rem] font-medium transition hover:border-ink">
                    {ar ? "إنشاء حساب" : "Create an account"}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** "Not you? Sign out" under the account row in the phone menu. */
export function DrawerSignOut() {
  const { lang, account } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(async () => {
          await signOut();
          if (pathname.startsWith("/account")) router.replace("/");
          router.refresh();
        })
      }
      disabled={pending}
      className="-mt-2 flex w-full items-center justify-center gap-2 text-[0.82rem] text-muted transition hover:text-ink disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5 stroke-[1.6] rtl:-scale-x-100" />}
      {ar ? `لست ${account?.firstName}؟ تسجيل الخروج` : `Not ${account?.firstName}? Sign out`}
    </button>
  );
}
