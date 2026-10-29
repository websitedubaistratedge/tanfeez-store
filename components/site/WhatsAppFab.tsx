"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSite } from "@/components/providers";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useUI } from "@/lib/store";

export function WhatsAppFab() {
  const { settings, t } = useSite();
  const pathname = usePathname();
  const hide = useUI((s) => s.menuOpen || s.cartOpen);
  if (hide || pathname.startsWith("/admin") || pathname.startsWith("/checkout") || pathname.startsWith("/shop/")) return null;
  return (
    <motion.a
      href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Hello TANFEEZ, I'd like to ask about…")}`}
      target="_blank"
      rel="noreferrer"
      aria-label={t("home.whatsapp")}
      className="group fixed bottom-5 end-5 z-40 flex h-12 items-center gap-2 rounded-full bg-white ps-3 pe-3 text-ink shadow-[0_8px_30px_-8px_rgba(0,0,0,0.25)] ring-1 ring-line transition-[padding] duration-500 hover:pe-5 no-print"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white">
        <WhatsAppIcon className="h-4 w-4" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[0.85rem] font-medium transition-[max-width] duration-500 group-hover:max-w-[160px]">{t("home.whatsapp")}</span>
    </motion.a>
  );
}
