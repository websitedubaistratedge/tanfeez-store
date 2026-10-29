"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, FileText, Hammer, Loader2, Ruler, Sofa, UploadCloud, Wrench, X } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { EMIRATES, emirateName } from "@/lib/i18n";
import { submitQuote } from "@/lib/actions";
import { EASE } from "@/components/ui/motion";

type Service = "fitout" | "furniture" | "technical" | "custom";

const SPACES = [
  ["Retail boutique", "متجر / بوتيك"],
  ["Café / Restaurant", "مقهى / مطعم"],
  ["Office", "مكتب"],
  ["Kiosk", "كشك"],
  ["Villa", "فيلا"],
  ["Apartment", "شقة"],
  ["Hotel / Hospitality", "فندق / ضيافة"],
  ["Clinic", "عيادة"],
  ["Other", "أخرى"],
] as const;
const BUDGETS = ["< AED 10k", "AED 10k – 50k", "AED 50k – 100k", "AED 100k – 250k", "AED 250k – 500k", "AED 500k+"];
const TIMELINES = [
  ["ASAP", "في أسرع وقت"],
  ["Within a month", "خلال شهر"],
  ["1 – 3 months", "1 – 3 أشهر"],
  ["3 – 6 months", "3 – 6 أشهر"],
  ["Just exploring", "أستكشف فقط"],
] as const;

export function QuoteWizard({ initialService, product }: { initialService?: string; product?: string }) {
  const { t, lang, dir } = useSite();
  const ar = lang === "ar";
  const valid = ["fitout", "furniture", "technical", "custom"].includes(initialService ?? "");
  const [step, setStep] = useState(valid ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [service, setService] = useState<Service | null>(valid ? (initialService as Service) : null);
  const [space, setSpace] = useState<string>("");
  const [area, setArea] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [details, setDetails] = useState(product ? (ar ? `أرغب في نسخة مخصصة من: ${product}\n` : `I'd like a custom version of: ${product}\n`) : "");
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const STEPS = 5;
  const canNext = [!!service, !!space, !!budget && !!timeline, true, true][step];
  const go = (n: number) => {
    setDirection(n > step ? 1 : -1);
    setStep(n);
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const ok = Array.from(list).filter((f) => f.size <= 10 * 1024 * 1024);
    setFiles((prev) => [...prev, ...ok].slice(0, 5));
  };

  const submit = (fd: FormData) => {
    if (step < STEPS - 1) return;
    setError(false);
    fd.set("service", service ?? "fitout");
    fd.set("space", space);
    fd.set("area", area);
    fd.set("emirate", emirate);
    fd.set("budget", budget);
    fd.set("timeline", timeline);
    fd.set("details", details);
    if (product) fd.set("product", product);
    files.forEach((f) => fd.append("files", f));
    start(async () => {
      const r = await submitQuote(fd);
      if (r.ok) setDone(r.number);
      else setError(true);
    });
  };

  const services = [
    { id: "fitout" as const, Icon: Hammer, title: t("services.fitout"), d: t("services.fitoutD") },
    { id: "furniture" as const, Icon: Sofa, title: t("services.furniture"), d: t("services.furnitureD") },
    { id: "technical" as const, Icon: Wrench, title: t("services.technical"), d: t("services.technicalD") },
    { id: "custom" as const, Icon: Ruler, title: t("quote.custom"), d: t("quote.customD") },
  ];

  const sign = dir === "rtl" ? -1 : 1;

  if (done) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[32px] bg-white p-8 text-center">
        <svg viewBox="-10 -10 257 184" className="h-24 w-auto overflow-visible">
          <path d="M103 0 160 57 133 84 103 54 26 131 0 105 31 74 31 32 56 32 56 47Z" fill="#231F20" />
          <motion.path d="M210 34 237 61 134 164 76 106 103 79 134 110Z" fill="#FFCB06" initial={{ scale: 2, opacity: 0, x: 40, y: -40 }} animate={{ scale: 1, opacity: 1, x: 0, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} style={{ transformOrigin: "150px 110px" }} />
        </svg>
        <h2 className="mt-8 font-display text-4xl font-semibold tracking-tight">{t("quote.done")}</h2>
        <p className="mt-3 max-w-md text-lg text-ink/70">{t("quote.doneD", { n: done })}</p>
        <Link href="/projects" className="mt-8 rounded-full bg-ink px-7 py-4 font-medium text-white">{t("home.allProjects")}</Link>
      </div>
    );
  }

  return (
    <form action={submit} className="overflow-hidden bg-white ring-1 ring-line">
      {/* Progress */}
      <div className="border-b border-ink/10 px-6 py-5 md:px-10">
        <div className="mb-3 flex items-center justify-between text-sm font-medium">
          <span>{t("quote.step")} {step + 1} {t("quote.of")} {STEPS}</span>
          <span className="text-ink/40" dir="ltr">{Math.round(((step + 1) / STEPS) * 100)}%</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
              <motion.div className="h-full bg-brand" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5, ease: EASE }} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-h-[460px] px-6 py-8 md:px-10 md:py-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: 50 * direction * sign }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 * direction * sign }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {step === 0 && (
              <>
                <H>{t("quote.q1")}</H>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map(({ id, Icon, title, d }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => {
                        setService(id);
                        setTimeout(() => go(1), 220);
                      }}
                      className={clsx("group flex flex-col items-start gap-4 rounded-none border p-5 text-start transition", service === id ? "border-ink bg-ink text-white" : "border-ink/10 hover:border-ink/40")}
                    >
                      <span className={clsx("flex h-12 w-12 items-center justify-center rounded-2xl transition", service === id ? "bg-brand text-ink" : "bg-plate group-hover:bg-brand")}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <span>
                        <span className="block text-lg font-medium">{title}</span>
                        <span className={clsx("mt-1 block text-sm", service === id ? "text-white/70" : "text-muted")}>{d}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <H>{t("quote.q2")}</H>
                <Label>{t("quote.spaceType")}</Label>
                <Chips options={SPACES.map(([en, a]) => ({ v: en, l: ar ? a : en }))} value={space} onChange={setSpace} />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label>
                    <Label>{t("quote.area")}</Label>
                    <input value={area} onChange={(e) => setArea(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="120" className="field bg-transparent" dir="ltr" />
                  </label>
                  <label>
                    <Label>{t("checkout.emirate")}</Label>
                    <select value={emirate} onChange={(e) => setEmirate(e.target.value)} className="field bg-transparent">
                      {EMIRATES.map((e) => (
                        <option key={e} value={e}>{emirateName(e, lang)}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <H>{t("quote.q3")}</H>
                <Label>{t("quote.budget")}</Label>
                <Chips options={BUDGETS.map((b) => ({ v: b, l: b }))} value={budget} onChange={setBudget} ltr />
                <div className="mt-7">
                  <Label>{t("quote.timeline")}</Label>
                  <Chips options={TIMELINES.map(([en, a]) => ({ v: en, l: ar ? a : en }))} value={timeline} onChange={setTimeline} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <H>{t("quote.q4")}</H>
                <Label>{t("quote.details")}</Label>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} placeholder={t("quote.detailsPh")} className="field resize-none" />
                <div className="mt-5">
                  <Label>{t("quote.files")}</Label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDrag(false);
                      addFiles(e.dataTransfer.files);
                    }}
                    onClick={() => fileRef.current?.click()}
                    className={clsx("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition", drag ? "border-ink bg-plate" : "border-ink/15 hover:border-ink/40")}
                  >
                    <motion.span animate={drag ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}>
                      <UploadCloud className="h-8 w-8 text-ink/50" />
                    </motion.span>
                    <span className="text-sm font-semibold text-muted">{t("quote.filesD")}</span>
                    <input ref={fileRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={(e) => addFiles(e.target.files)} />
                  </div>
                  {files.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 rounded-full bg-plate py-1.5 pe-2 ps-3 text-sm font-semibold">
                          <FileText className="h-4 w-4" />
                          <span className="max-w-[160px] truncate">{f.name}</span>
                          <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="rounded-full p-0.5 hover:bg-ink/10" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <H>{t("quote.q5")}</H>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label><Label>{t("checkout.name")}</Label><input name="name" required className="field bg-transparent" autoComplete="name" /></label>
                  <label><Label>{t("quote.company")}</Label><input name="company" className="field bg-transparent" autoComplete="organization" /></label>
                  <label><Label>{t("checkout.phone")}</Label><input name="phone" required type="tel" className="field bg-transparent" dir="ltr" autoComplete="tel" placeholder="+971 5x xxx xxxx" /></label>
                  <label><Label>{t("checkout.email")}</Label><input name="email" required type="email" className="field bg-transparent" dir="ltr" autoComplete="email" /></label>
                </div>
                {error && <p className="mt-4 text-sm font-semibold text-red-600">{t("common.error")}</p>}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-6 py-5 md:px-10">
        <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium transition hover:bg-ink/5 disabled:invisible">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("quote.back")}
        </button>
        {step < STEPS - 1 ? (
          <button type="button" onClick={() => canNext && go(step + 1)} disabled={!canNext} className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 font-medium text-white transition hover:bg-ink-2 disabled:opacity-30">
            {t("quote.next")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        ) : (
          <button disabled={pending} className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 font-medium text-ink transition hover:bg-ink hover:text-white">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {pending ? t("common.sending") : t("quote.submit")}
          </button>
        )}
      </div>
    </form>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">{children}</h2>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-sm font-medium text-ink/70">{children}</span>;
}
function Chips({ options, value, onChange, ltr }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void; ltr?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button type="button" key={o.v} onClick={() => onChange(o.v)} dir={ltr ? "ltr" : undefined} className={clsx("rounded-full border px-4 py-2.5 text-sm font-medium transition", value === o.v ? "border-ink bg-ink text-white" : "border-ink/10 hover:border-ink/40")}>
          {o.l}
        </button>
      ))}
    </div>
  );
}
