"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * In-page views (shop category, room filter, account tab…) kept in the address bar. Each change
 * is its own history step, so the Back button and the browser's back both return to the
 * previous view, and the view survives a refresh or a shared link.
 */
export function useUrlState<T extends string>(key: string, fallback: T, allowed?: readonly T[]): [T, (v: T) => void] {
  const raw = useSearchParams().get(key) as T | null;
  const fromUrl = raw && (!allowed || allowed.includes(raw)) ? raw : fallback;
  const [value, setValue] = useState<T>(fromUrl);
  useEffect(() => setValue(fromUrl), [fromUrl]);
  const set = (v: T) => {
    if (v === value) return;
    setValue(v);
    try {
      const url = new URL(window.location.href);
      if (v === fallback) url.searchParams.delete(key);
      else url.searchParams.set(key, v);
      window.history.pushState(null, "", url);
    } catch {}
  };
  return [value, set];
}
