import clsx from "clsx";

export function Mark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 237 164" className={className} aria-hidden>
      <path
        fill={light ? "#FFFFFF" : "#231F20"}
        d="M103 0 160 57 133 84 103 54 26 131 0 105 31 74 31 32 56 32 56 47Z"
      />
      <path fill="#FFCB06" d="M210 34 237 61 134 164 76 106 103 79 134 110Z" />
    </svg>
  );
}

export function Logo({
  light = false,
  className,
  sub = false,
}: {
  light?: boolean;
  className?: string;
  sub?: boolean;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)} dir="ltr">
      <Mark light={light} className="h-7 w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            "font-[family-name:var(--font-montserrat)] text-[1.15rem] font-black tracking-[-0.02em]",
            light ? "text-white" : "text-ink"
          )}
        >
          TANFEEZ
        </span>
        {sub && (
          <span className="mt-1 font-[family-name:var(--font-montserrat)] text-[0.45rem] font-bold tracking-[0.12em] text-brand">
            AAMAL TECHNICAL CONTRACTING LLC
          </span>
        )}
      </span>
    </span>
  );
}
