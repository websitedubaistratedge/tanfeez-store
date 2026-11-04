"use client";

import { createContext, useContext, useMemo } from "react";
import { t as translate, type TKey } from "@/lib/i18n";
import type { AccountInfo, Lang, MaterialCatalog } from "@/lib/types";

export type PublicSettings = {
  phone: string;
  mobile: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  hours: string;
  announcement: string;
  freeDeliveryOver: number;
  deliveryFees: Record<string, number>;
  materials: MaterialCatalog;
  company: { licence: string; authority: string; trn: string };
};

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: (k: TKey, v?: Record<string, string | number>) => string;
  settings: PublicSettings;
  /** The signed-in customer, or null for guests. */
  account: AccountInfo | null;
};

const SiteCtx = createContext<Ctx | null>(null);

export function SiteProvider({
  lang,
  settings,
  account = null,
  children,
}: {
  lang: Lang;
  settings: PublicSettings;
  account?: AccountInfo | null;
  children: React.ReactNode;
}) {
  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: (k, v) => translate(lang, k, v),
      settings,
      account,
    }),
    [lang, settings, account]
  );
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite() {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite outside SiteProvider");
  return c;
}
