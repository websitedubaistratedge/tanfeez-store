import Link from "next/link";
import clsx from "clsx";

/** Circled arrow used on links and outlined buttons (mirrors in RTL). */
export function CircleArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" className={clsx("h-[18px] w-[18px] shrink-0 rtl:-scale-x-100", className)} aria-hidden>
      <circle cx="10" cy="10" r="9.2" />
      <path d="M6 10h7.5M10.5 6.8 13.7 10l-3.2 3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Common = { href: string; children: React.ReactNode; className?: string; invert?: boolean };

/** Solid black pill. */
export function PillLink({ href, children, className, invert }: Common) {
  return (
    <Link
      href={href}
      className={clsx(
        "group inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-7 text-[0.92rem] font-medium transition-colors duration-300",
        invert ? "bg-white text-ink hover:bg-plate" : "bg-ink text-white hover:bg-ink-2",
        className
      )}
    >
      {children}
    </Link>
  );
}

/** Outlined pill with a circled arrow, BoConcept-style. */
export function OutlineLink({ href, children, className, invert }: Common) {
  return (
    <Link
      href={href}
      className={clsx(
        "group inline-flex h-12 items-center justify-center gap-3 rounded-full border px-6 text-[0.92rem] font-medium transition-colors duration-300",
        invert ? "border-white/60 text-white hover:bg-white hover:text-ink" : "border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white",
        className
      )}
    >
      {children}
      <CircleArrow className="transition-transform duration-500 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
    </Link>
  );
}

/** Text link with circled arrow and a drawn underline. */
export function ArrowLink({ href, children, className }: Omit<Common, "invert">) {
  return (
    <Link href={href} className={clsx("group inline-flex items-center gap-2.5 text-[0.95rem] font-medium", className)}>
      <CircleArrow className="transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
      <span className="link-u pb-0.5">{children}</span>
    </Link>
  );
}

/** Small uppercase eyebrow with the brand dot. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={clsx("flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {children}
    </p>
  );
}
