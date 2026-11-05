"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";

// Counts page views inside this visit (including category changes in the shop), so Back
// knows whether the previous step is ours.
let views = 0;

/** Mounted once in the site layout. */
export function NavTracker() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  useEffect(() => {
    views++;
  }, [pathname, query]);
  return null;
}

/**
 * "← Back" at the top of inner pages: returns to the previous page of the visit; when the
 * visitor landed here directly (from Google, WhatsApp…), goes to a sensible parent instead.
 */
export function BackButton({ fallback = "/", className, label }: { fallback?: string; className?: string; label?: string }) {
  const router = useRouter();
  const { lang } = useSite();
  const go = () => {
    const sameSite = (() => {
      try {
        return !!document.referrer && new URL(document.referrer).origin === location.origin;
      } catch {
        return false;
      }
    })();
    if (views > 1 || (sameSite && history.length > 1)) router.back();
    else router.push(fallback);
  };
  return (
    <button type="button" onClick={go} className={clsx("group inline-flex items-center gap-2 text-[0.88rem] text-ink/70 transition hover:text-ink", className)}>
      <ArrowLeft className="h-4 w-4 stroke-[1.5] transition group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
      {label ?? (lang === "ar" ? "رجوع" : "Back")}
    </button>
  );
}
