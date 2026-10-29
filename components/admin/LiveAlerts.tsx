"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Ruler, ShoppingBag, SwatchBook, X } from "lucide-react";
import type { PulseItem } from "@/app/api/admin/pulse/route";

// While any admin page is open, new orders, requests and messages pop up here with a
// chime, a desktop notification (when allowed and the tab is in the background) and an
// unread count in the tab title. Channels outside the browser live in lib/notify.ts.

const POLL_MS = 30_000;
const SOUND_KEY = "tz-alert-sound";

export const soundOn = () => {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
};
export const setSoundOn = (on: boolean) => {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {}
};

let audio: AudioContext | null = null;
/** A soft two-note bell, synthesised so there's no sound file to load. */
export function chime() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
    const t = audio.currentTime;
    [880, 1318.5].forEach((f, i) => {
      const o = audio!.createOscillator();
      const g = audio!.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t + i * 0.14);
      g.gain.linearRampToValueAtTime(0.12, t + i * 0.14 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.14 + 0.9);
      o.connect(g).connect(audio!.destination);
      o.start(t + i * 0.14);
      o.stop(t + i * 0.14 + 1);
    });
  } catch {}
}

const ICON = { order: ShoppingBag, quote: Ruler, samples: SwatchBook, message: Mail } as const;

export function LiveAlerts() {
  const router = useRouter();
  const [toasts, setToasts] = useState<PulseItem[]>([]);
  const state = useRef({ v: -1, since: "", seen: new Set<string>(), unread: 0, title: "" });

  useEffect(() => {
    const s = state.current;
    let stopped = false;
    let busy = false;

    const setTitle = () => {
      const base = document.title.replace(/^\(\d+\) /, "");
      document.title = s.unread ? `(${s.unread}) ${base}` : base;
    };

    const poll = async () => {
      if (busy || stopped) return;
      busy = true;
      try {
        const q = new URLSearchParams({ v: String(s.v), ...(s.since ? { since: s.since } : {}) });
        const res = await fetch(`/api/admin/pulse?${q}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { version: number; now: string; items: PulseItem[] };
        s.v = data.version;
        if (!s.since) {
          s.since = data.now; // start listening from the moment the admin opened
          return;
        }
        const fresh = data.items.filter((i) => !s.seen.has(i.key));
        fresh.forEach((i) => s.seen.add(i.key));
        if (data.items.length) s.since = data.items[data.items.length - 1].at;
        if (!fresh.length) return;

        setToasts((t) => [...fresh.slice(-3).reverse(), ...t].slice(0, 4));
        if (soundOn()) chime();
        if (document.hidden) {
          s.unread += fresh.length;
          setTitle();
          if (typeof Notification !== "undefined" && Notification.permission === "granted")
            for (const i of fresh.slice(-3)) {
              const n = new Notification(i.title, { body: i.sub, tag: i.key, icon: "/brand/favicon.svg" });
              n.onclick = () => {
                window.focus();
                router.push(i.href);
                n.close();
              };
            }
        }
        router.refresh(); // badges, lists and the dashboard pick up the new record
      } catch {
        // offline or a deploy in progress — try again next round
      } finally {
        busy = false;
      }
    };

    const onVisible = () => {
      if (document.hidden) return;
      s.unread = 0;
      setTitle();
      void poll();
    };
    // Browsers only let sound play after the page has been interacted with.
    const unlock = () => {
      try {
        audio ??= new AudioContext();
        void audio.resume();
      } catch {}
    };

    void poll();
    const id = setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pointerdown", unlock);
    };
  }, [router]);

  // Each toast leaves on its own after a while; hovering doesn't matter much for a short card.
  useEffect(() => {
    if (!toasts.length) return;
    const id = setTimeout(() => setToasts((t) => t.slice(0, -1)), 15_000);
    return () => clearTimeout(id);
  }, [toasts]);

  const dismiss = (key: string) => setToasts((t) => t.filter((x) => x.key !== key));

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:end-6 sm:bottom-6 sm:w-[360px]">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICON[t.kind];
          return (
            <motion.div
              key={t.key}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3 pe-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand">
                <Icon className="h-[18px] w-[18px]" />
                <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-ink/60" />
              </span>
              <Link href={t.href} onClick={() => dismiss(t.key)} className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="truncate text-[0.8rem] text-muted">{t.sub}</p>
              </Link>
              <Link href={t.href} onClick={() => dismiss(t.key)} className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-[0.76rem] font-medium text-white hover:bg-ink-2">
                View
              </Link>
              <button onClick={() => dismiss(t.key)} className="shrink-0 rounded-full p-1.5 text-ink/40 hover:bg-plate hover:text-ink" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
