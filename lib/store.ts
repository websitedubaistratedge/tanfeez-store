"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { Product } from "./types";

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: { en: string; ar: string };
  image: string;
  price: number;
  qty: number;
  finish?: string;
  size?: string;
  material?: string;
  colour?: string;
};

type CartState = {
  items: CartLine[];
  add: (line: Omit<CartLine, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const safeStorage = createJSONStorage(() => {
  try {
    const k = "__tz";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    };
  }
});

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (line, qty = 1) =>
        set((s) => {
          const key = [line.productId, line.material, line.colour, line.finish, line.size].join("|");
          const existing = s.items.find((i) => i.key === key);
          if (existing)
            return { items: s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i)) };
          return { items: [...s.items, { ...line, key, qty }] };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(20, qty)) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "tz-cart", storage: safeStorage }
  )
);

type WishState = { ids: string[]; toggle: (id: string) => void };
export const useWishlist = create<WishState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
    }),
    { name: "tz-wish", storage: safeStorage }
  )
);

type UIState = {
  cartOpen: boolean;
  menuOpen: boolean;
  setCart: (v: boolean) => void;
  setMenu: (v: boolean) => void;
};
export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  menuOpen: false,
  setCart: (cartOpen) => set({ cartOpen }),
  setMenu: (menuOpen) => set({ menuOpen }),
}));

/** Quick view: which product is open, and which card it opened from (for the shared image morph). */
type QuickViewState = {
  product: Product | null;
  source: string | null;
  open: (p: Product, source: string) => void;
  close: () => void;
};
export const useQuickView = create<QuickViewState>()((set) => ({
  product: null,
  source: null,
  open: (product, source) => set({ product, source }),
  close: () => set({ product: null }),
}));

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export const cartCount = (items: CartLine[]) => items.reduce((s, i) => s + i.qty, 0);
export const cartTotal = (items: CartLine[]) => items.reduce((s, i) => s + i.qty * i.price, 0);
