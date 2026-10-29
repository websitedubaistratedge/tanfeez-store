"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers";

// First-visit intro. Everything up to the reveal is CSS (see .pl-* in globals.css) so it
// plays from the very first paint, before React hydrates. This component only decides
// when to reveal: after the reel has run and its images are in, capped so a slow
// network never holds the site hostage.

const REEL = ["/images/intro/1.jpg", "/images/intro/2.jpg", "/images/intro/3.jpg", "/images/intro/4.jpg", "/images/intro/5.jpg"];
const WORD = "TANFEEZ".split("");
const HOLD_MS = 350; // pause on the last frame before opening up
const MAX_MS = 5000; // never hold the site longer than this

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
    const imgs = Array.from(ref.current?.querySelectorAll("img") ?? []);
    const loaded = Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {}))));
    // Reveal only once the reel has landed on its last frame (timed from when the intro
    // actually started painting, not from navigation), plus a beat to let it breathe.
    const reelDone = Promise.all(imgs.at(-1)?.getAnimations().map((a) => a.finished) ?? []).catch(() => {});
    const minWait = reelDone.then(() => new Promise((r) => setTimeout(r, reduced ? 0 : HOLD_MS)));
    const cap = new Promise((r) => setTimeout(r, MAX_MS));
    let timer: ReturnType<typeof setTimeout>;

    Promise.race([Promise.all([loaded, minWait]), cap]).then(() => {
      window.scrollTo(0, 0);
      ref.current?.classList.add("pl-exit");
      root.dataset.intro = "done"; // lets the page's own entrance animations start under the reveal
      try {
        sessionStorage.setItem("tz-intro", "1");
      } catch {}
      timer = setTimeout(() => setGone(true), reduced ? 400 : 1700);
    });
    return () => clearTimeout(timer);
  }, []);

  if (gone) return null;

  return (
    <div ref={ref} className="preloader" aria-hidden>
      {/* The reel: full-bleed rooms seen through a small window that opens onto the site */}
      <div className="pl-window">
        {REEL.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" className="pl-frame" style={{ animationDelay: `${0.25 + i * 0.42}s` }} fetchPriority={i === 0 ? "high" : "auto"} decoding="async" />
        ))}
      </div>

      <div className="pl-ui">
        <p className="pl-top">{lang === "ar" ? "نجهّز المجموعة" : "Preparing the collection"}</p>

        <div className="pl-brand" dir="ltr">
          <svg viewBox="-6 -6 249 176" className="pl-mark">
            <path className="pl-mark-ink" pathLength={1} d="M103 0 160 57 133 84 103 54 26 131 0 105 31 74 31 32 56 32 56 47Z" />
            <path className="pl-mark-sun" d="M210 34 237 61 134 164 76 106 103 79 134 110Z" />
          </svg>
          <span className="pl-word">
            {WORD.map((ch, i) => (
              <span key={i} className="pl-letter">
                <span style={{ animationDelay: `${0.95 + i * 0.05}s` }}>{ch}</span>
              </span>
            ))}
          </span>
        </div>

        <div className="pl-bottom">
          <p className="pl-tag">{lang === "ar" ? "أثاث وتصاميم داخلية، تُنفَّذ بإتقان" : "Furniture & interiors, beautifully executed"}</p>
          <p className="pl-count" dir="ltr" />
        </div>
        <span className="pl-bar" />
      </div>
    </div>
  );
}
