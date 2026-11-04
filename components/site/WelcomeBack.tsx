"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSite } from "@/components/providers";
import { EASE } from "@/components/ui/motion";

const KEY = "tz-welcomed";
/** Call after signing in or creating an account, so the greeting doesn't repeat what they just did. */
export const markWelcomed = () => {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
};

/** A quiet "Welcome back" for signed-in customers, once per visit. */
export function WelcomeBack() {
  const { account, lang } = useSite();
  const ar = lang === "ar";
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!account || pathname.startsWith("/admin")) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    // On the home page, wait for the intro animation to finish.
    const t1 = setTimeout(() => {
      markWelcomed();
      setShow(true);
    }, pathname === "/" ? 3200 : 900);
    const t2 = setTimeout(() => setShow(false), pathname === "/" ? 8200 : 5900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [account?.id]);

  return (
    <AnimatePresence>
      {show && account && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.25 } }}
          transition={{ duration: 0.5, ease: EASE }}
          className="pointer-events-none fixed inset-x-4 bottom-[calc(72px+env(safe-area-inset-bottom))] z-[55] flex justify-center no-print lg:bottom-8"
          role="status"
        >
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-white/95 py-1.5 pe-2 ps-1.5 shadow-[0_12px_36px_-14px_rgba(0,0,0,0.25)] backdrop-blur">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[0.75rem] font-semibold text-white">{account.firstName.charAt(0).toUpperCase()}</span>
            <span className="text-[0.88rem]">
              {ar ? `مرحباً بعودتك، ${account.firstName}` : `Welcome back, ${account.firstName}`}
              <Link href="/account" onClick={() => setShow(false)} className="ms-2 text-[0.82rem] text-muted underline underline-offset-2 hover:text-ink">
                {ar ? "حسابي" : "My account"}
              </Link>
            </span>
            <button onClick={() => setShow(false)} className="flex h-7 w-7 items-center justify-center rounded-full text-ink/40 hover:bg-plate hover:text-ink" aria-label={ar ? "إغلاق" : "Close"}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
