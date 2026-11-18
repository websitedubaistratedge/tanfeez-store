"use client";

import clsx from "clsx";
import { useSite } from "@/components/providers";
import { WhatsAppIcon } from "@/components/ui/icons";

/** One piece in an "Ask for price" message: its name, the options picked and its page. */
export type AskItem = { name: string; options?: string; slug?: string };

const SITE = "https://tanfeez.me";

/** Prices are shown only once the team switches them on in Admin → Settings. */
export function useShowPrices() {
  return useSite().settings.showPrices;
}

/** A WhatsApp link to the team, pre-written with the pieces the customer is asking about. */
export function useAskPriceHref() {
  const { settings, lang } = useSite();
  const ar = lang === "ar";
  return (items: AskItem[]) => {
    const lines = items.map((i) => `• ${i.name}${i.options ? ` (${i.options})` : ""}${i.slug ? `\n  ${SITE}/shop/${i.slug}` : ""}`);
    const intro = ar
      ? items.length > 1 ? "مرحباً تنفيذ، أود معرفة أسعار هذه القطع:" : "مرحباً تنفيذ، أود معرفة سعر هذه القطعة:"
      : items.length > 1 ? "Hello TANFEEZ, could you share the prices of these pieces?" : "Hello TANFEEZ, could you share the price of this piece?";
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent([intro, ...lines].join("\n"))}`;
  };
}

/** "Ask for price" — opens WhatsApp with the piece(s) already named. */
export function AskPriceButton({ items, className, label, icon = true }: { items: AskItem[]; className?: string; label?: string; icon?: boolean }) {
  const { lang } = useSite();
  const href = useAskPriceHref();
  return (
    <a href={href(items)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className={clsx("inline-flex items-center justify-center gap-2", className)}>
      {icon && <WhatsAppIcon className="h-4 w-4 shrink-0" />}
      {label ?? (lang === "ar" ? "اسأل عن السعر" : "Ask for price")}
    </a>
  );
}

/** The quiet text that stands where a price would be. */
export function AskPriceLabel({ className }: { className?: string }) {
  const { lang } = useSite();
  return <span className={clsx("font-normal text-muted", className)}>{lang === "ar" ? "اسأل عن السعر" : "Ask for price"}</span>;
}
