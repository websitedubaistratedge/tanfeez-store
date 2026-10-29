"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
const cx = (...a: Parameters<typeof clsx>) => twMerge(clsx(...a));

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise into view once. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** Masked line-by-line headline reveal. Pass lines as an array. */
export function SplitLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  immediate = false,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const show = immediate || inView;
  return (
    <div ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="split-line block overflow-hidden pb-[0.08em]">
          <motion.span
            className={clsx("block", lineClassName)}
            initial={{ y: "110%" }}
            animate={show ? { y: "0%" } : {}}
            transition={{ duration: 1.05, ease: EASE, delay: delay + i * 0.09 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

/** Words light up as the paragraph scrolls through the viewport. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={clsx("flex flex-wrap", className)}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span className="relative me-[0.25em] mt-[0.1em]">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

/** Magnetic hover wrapper for buttons. */
export function Magnetic({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.3 });
  return (
    <motion.div
      ref={ref}
      className={cx("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** 3D tilt card following the pointer, with a glare highlight. */
export function Tilt({ children, className, max = 8 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 160, damping: 18 });
  const sry = useSpring(ry, { stiffness: 160, damping: 18 });
  const glare = useTransform([gx, gy] as MotionValue<number>[], ([a, b]) =>
    `radial-gradient(circle at ${a}% ${b}%, rgba(255,255,255,0.22), transparent 55%)`
  );
  return (
    <motion.div
      ref={ref}
      className={clsx("relative [transform-style:preserve-3d]", className)}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * max * 2);
        rx.set(-(py - 0.5) * max * 2);
        gx.set(px * 100);
        gy.set(py * 100);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
      <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glare }} />
    </motion.div>
  );
}

/** Animated number that counts up when visible. */
export function CountUp({ to, suffix = "", prefix = "", className, raw = false }: { to: number; suffix?: string; prefix?: string; className?: string; raw?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setV(to);
    const c = animate(0, to, { duration: 2.2, ease: EASE, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {raw ? v : v.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/** Parallax image wrapper. */
export function Parallax({ children, className, amount = 80 }: { children: React.ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);
  return (
    <div ref={ref} className={clsx("overflow-hidden", !className?.includes("absolute") && "relative", className)}>
      <motion.div style={{ y }} className="absolute inset-[-12%_0]">
        {children}
      </motion.div>
    </div>
  );
}
