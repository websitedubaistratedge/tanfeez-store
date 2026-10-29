"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers";

// First-visit intro. Everything up to the reveal is CSS (see .pl-* in globals.css) so it
// plays from the very first paint, before React hydrates. This component only decides
// when to lift the curtain: once the wordmark has landed, capped so it never holds the site.

const WORD = "TANFEEZ".split("");
const HOLD_MS = 280; // a beat on the finished logo before lifting
const MAX_MS = 4000; // never hold the site longer than this

/** Runs inline before first paint: skip the intro for the rest of the browser session. */
export const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{d.dataset.intro=sessionStorage.getItem("tz-intro")?"seen":"playing"}catch(e){d.dataset.intro="seen"}})()`;

export function Preloader() {
  const { lang } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "playing") {
      setGone(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Timed from the animations themselves (they start at first paint), not from navigation.
    const line = ref.current?.querySelector(".pl-line");
    const landed = Promise.all(line?.getAnimations().map((a) => a.finished) ?? []).catch(() => {});
    const ready = landed.then(() => new Promise((r) => setTimeout(r, reduced ? 0 : HOLD_MS)));
    const cap = new Promise((r) => setTimeout(r, MAX_MS));
    let timer: ReturnType<typeof setTimeout>;

    Promise.race([ready, cap]).then(() => {
      window.scrollTo(0, 0);
      ref.current?.classList.add("pl-exit");
      root.dataset.intro = "done"; // the page's own entrance animations start as the curtain lifts
      try {
        sessionStorage.setItem("tz-intro", "1");
      } catch {}
      timer = setTimeout(() => setGone(true), reduced ? 300 : 1300);
    });
    return () => clearTimeout(timer);
  }, []);

  if (gone) return null;

  return (
    <div ref={ref} className="preloader" aria-hidden>
      <div className="pl-sheet pl-sheet-sun" />
      <div className="pl-sheet pl-sheet-paper">
        <div className="pl-lockup" dir="ltr">
          <svg viewBox="-6 -6 249 176" className="pl-mark">
            <path className="pl-mark-ink" pathLength={1} d="M103 0 160 57 133 84 103 54 26 131 0 105 31 74 31 32 56 32 56 47Z" />
            <path className="pl-mark-sun" d="M210 34 237 61 134 164 76 106 103 79 134 110Z" />
          </svg>
          <span className="pl-word">
            {WORD.map((ch, i) => (
              <span key={i} className="pl-letter">
                <span style={{ animationDelay: `${0.75 + i * 0.045}s` }}>{ch}</span>
              </span>
            ))}
          </span>
          <span className="pl-line" />
          <span className="pl-tag">{lang === "ar" ? "أثاث وتصاميم داخلية · دبي" : "Furniture & interiors · Dubai"}</span>
        </div>
      </div>
    </div>
  );
}
