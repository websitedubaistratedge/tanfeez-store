"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Info, Loader2, Package, X } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { EMIRATES, emirateName, money } from "@/lib/i18n";
import { configPrice, materialsFor, sizeDelta, type Material, type Swatch } from "@/lib/configurator";
import { requestSamples } from "@/lib/actions";
import { EASE } from "@/components/ui/motion";
import { lockScroll } from "@/components/site/SmoothScroll";
import type { Product } from "@/lib/types";

/** Woven-fabric look for swatches: base colour + fine crosshatch + soft light. */
export function fabricStyle(hex: string, wood = false): React.CSSProperties {
  return {
    backgroundColor: hex,
    backgroundImage: wood
      ? "repeating-linear-gradient(100deg, rgba(255,255,255,0.10) 0 2px, rgba(0,0,0,0.06) 2px 5px, transparent 5px 11px), radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), transparent 60%)"
      : "repeating-linear-gradient(45deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 3px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 3px), radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), transparent 60%)",
  };
}

/** Number that glides to its new value. */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const { lang } = useSite();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      return;
    }
    const c = animate(prev.current, value, { duration: 0.8, ease: EASE, onUpdate: (n) => setShown(n) });
    prev.current = value;
    return () => c.stop();
  }, [value, reduce]);
  return <span className={clsx("tabular-nums", className)}>{money(shown, lang)}</span>;
}

/* ───────────── Tabby / Tamara ───────────── */
export function TabbyBadge({ className }: { className?: string }) {
  return <span className={clsx("inline-flex items-center rounded-[5px] bg-[#3BFFC1] px-1.5 py-[1px] text-[0.78rem] font-bold tracking-tight text-[#292929]", className)}>tabby</span>;
}
export function TamaraBadge({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-[5px] bg-gradient-to-r from-[#F7B5A4] via-[#E9A7D6] to-[#B7A5F4] px-1.5 py-[1px] text-[0.78rem] font-bold tracking-tight text-[#1a1a1a]", className)}>
      tamara
    </span>
  );
}

export function Installments({ price }: { price: number }) {
  const { lang } = useSite();
  const [open, setOpen] = useState(false);
  useEffect(() => lockScroll(open), [open]);
  const ar = lang === "ar";
  const plan = (n: number) => Array.from({ length: n }, (_, i) => ({ i, amount: Math.ceil(price / n) }));
  const when = (i: number) => {
    if (i === 0) return ar ? "اليوم" : "Today";
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return d.toLocaleDateString(ar ? "ar-AE" : "en-GB", { day: "numeric", month: "short" });
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="group mt-3 flex w-full flex-wrap items-center gap-x-2 gap-y-1.5 border border-line px-4 py-3 text-start text-[0.85rem] transition hover:border-ink/40">
        <span>
          {ar ? "أو 4 دفعات بدون فوائد بقيمة " : "or 4 interest-free payments of "}
          <span className="font-semibold tabular-nums">{money(Math.ceil(price / 4), lang)}</span>
        </span>
        <TabbyBadge />
        <span className="text-muted">{ar ? "أو" : "or"}</span>
        <TamaraBadge />
        <Info className="ms-auto h-4 w-4 stroke-[1.5] text-muted transition group-hover:text-ink" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal>
            <motion.div className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="relative w-full max-w-lg bg-white p-6 sm:p-8" data-lenis-prevent>
              <button onClick={() => setOpen(false)} className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-plate" aria-label="Close"><X className="h-4 w-4" /></button>
              <h3 className="font-display text-[1.4rem] font-semibold tracking-tight">{ar ? "اشترِ الآن وادفع لاحقاً" : "Buy now, pay later"}</h3>
              <p className="mt-1 text-[0.88rem] text-muted">{ar ? "بدون فوائد أو رسوم. الموافقة خلال ثوانٍ عند إتمام الطلب." : "No interest, no fees. Approval in seconds at checkout."}</p>

              {[
                { badge: <TabbyBadge />, n: 4, label: ar ? "قسّمها على 4" : "Split in 4" },
                { badge: <TamaraBadge />, n: 3, label: ar ? "قسّمها على 3" : "Split in 3" },
              ].map(({ badge, n, label }) => (
                <div key={n} className="mt-6 border-t border-line pt-5">
                  <div className="mb-4 flex items-center gap-2 text-[0.92rem] font-medium">{badge} {label}</div>
                  <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
                    <span className="absolute inset-x-[12%] top-[11px] h-px bg-line" />
                    {plan(n).map(({ i, amount }) => (
                      <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="relative flex flex-col items-center text-center">
                        <span className="relative h-[22px] w-[22px] rounded-full border border-ink bg-white">
                          <span className="absolute inset-[3px] rounded-full bg-ink" style={{ clipPath: `inset(${100 - ((i + 1) / n) * 100}% 0 0 0)` }} />
                        </span>
                        <span className="mt-2 text-[0.88rem] font-semibold tabular-nums">{money(amount, lang)}</span>
                        <span className="text-[0.75rem] text-muted">{when(i)}</span>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              ))}
              <p className="mt-6 text-[0.75rem] text-faint">{ar ? "يتم اختيار طريقة الدفع عند إتمام الطلب." : "Choose Tabby or Tamara as your payment method at checkout."}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───────────── The configurator ───────────── */
export type Config = { material: string; colour: string; size: number };

export function Configurator({ product: p, cfg, setCfg }: { product: Product; cfg: Config; setCfg: (c: Config) => void }) {
  const { lang, t } = useSite();
  const ar = lang === "ar";
  const mats = materialsFor(p);
  const mat = mats.find((m) => m.id === cfg.material) ?? mats[0];
  const colour = mat.colours.find((c) => c.id === cfg.colour) ?? mat.colours[0];
  const price = configPrice(p, cfg);
  const wood = mats[0].id === "oak";
  const [samples, setSamples] = useState(false);

  return (
    <div className="mt-7 space-y-7">
      {/* Material */}
      <div>
        <StepTitle n={1} title={wood ? (ar ? "الخشب والتشطيب" : "Wood & finish") : ar ? "القماش" : "Fabric"} value={tx(mat.name)} />
        <div className="grid grid-cols-2 gap-2">
          {mats.map((m) => {
            const on = m.id === mat.id;
            const add = Math.round(((p.salePrice || p.price) * m.delta) / 50) * 50;
            return (
              <button key={m.id} onClick={() => setCfg({ ...cfg, material: m.id, colour: m.colours[0].id })} className={clsx("relative flex items-start gap-3 border p-3 text-start transition", on ? "border-ink" : "border-line hover:border-ink/40")}>
                {on && <motion.span layoutId={`mat-${p.id}`} className="absolute inset-0 border-[1.5px] border-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="mt-0.5 h-8 w-8 shrink-0 rounded-full ring-1 ring-black/10" style={fabricStyle(m.colours[0].hex, wood)} />
                <span className="min-w-0">
                  <span className="block text-[0.86rem] font-medium leading-tight">{tx(m.name)}</span>
                  <span className="mt-0.5 block text-[0.74rem] leading-snug text-muted">{tx(m.note)}</span>
                  <span className={clsx("mt-1 block text-[0.74rem] tabular-nums", add ? "text-ink" : "text-emerald-700")}>{add ? `+ ${money(add, lang)}` : ar ? "مشمول" : "Included"}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colour */}
      <div>
        <StepTitle n={2} title={ar ? "اللون" : "Colour"} value={tx(colour.name)} />
        <div className="flex flex-wrap gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {mat.colours.map((c, k) => (
              <motion.button
                key={`${mat.id}-${c.id}`}
                layout
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ delay: k * 0.04, type: "spring", stiffness: 380, damping: 24 }}
                onClick={() => setCfg({ ...cfg, colour: c.id })}
                title={tx(c.name)}
                aria-label={tx(c.name)}
                className={clsx("h-11 w-11 rounded-full ring-offset-[3px] transition-shadow", c.id === colour.id ? "ring-[1.5px] ring-ink" : "ring-1 ring-black/10 hover:ring-black/30")}
                style={fabricStyle(c.hex, wood)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Size */}
      {p.sizes.length > 0 && (
        <div>
          <StepTitle n={3} title={t("shop.size")} value={p.sizes[cfg.size]} />
          <div className="flex flex-wrap gap-2">
            {p.sizes.map((s, i) => {
              const add = sizeDelta(p, i);
              return (
                <button key={s} onClick={() => setCfg({ ...cfg, size: i })} className={clsx("relative h-11 rounded-full border px-4 text-[0.85rem] transition", cfg.size === i ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
                  {s}
                  {add > 0 && <span className={clsx("ms-2 text-[0.75rem] tabular-nums", cfg.size === i ? "text-white/70" : "text-muted")}>+{money(add, lang)}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4 text-[0.8rem] text-muted">
        <span>{ar ? "السعر الأساسي" : "Base"} {money(price.base, lang)}</span>
        <AnimatePresence>
          {price.materialAdd > 0 && (
            <motion.span key="m" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              + {tx(mat.name)} {money(price.materialAdd, lang)}
            </motion.span>
          )}
          {price.sizeAdd > 0 && (
            <motion.span key="s" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              + {p.sizes[cfg.size]} {money(price.sizeAdd, lang)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <button onClick={() => setSamples(true)} className="group flex w-full items-center gap-4 bg-band p-4 text-start transition hover:bg-[#efe8dd]">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          {mat.colours.slice(0, 3).map((c, k) => (
            <span key={c.id} className="absolute h-8 w-8 rounded-[6px] shadow-sm ring-1 ring-black/5 transition-transform duration-500 group-hover:rotate-0" style={{ ...fabricStyle(c.hex, wood), transform: `translate(${(k - 1) * 7}px, ${(k - 1) * -3}px) rotate(${(k - 1) * 12}deg)` }} />
          ))}
        </span>
        <span className="flex-1">
          <span className="block text-[0.9rem] font-medium">{ar ? "اطلب عينات أقمشة مجانية" : "Request free fabric samples"}</span>
          <span className="block text-[0.8rem] text-muted">{ar ? "حتى 4 عينات، توصل خلال 2–3 أيام" : "Up to 4 swatches, delivered in 2–3 days"}</span>
        </span>
        <Package className="h-5 w-5 stroke-[1.5] transition group-hover:-translate-y-0.5" />
      </button>

      <SamplesModal open={samples} onClose={() => setSamples(false)} product={p} materials={mats} initial={`${mat.id}:${colour.id}`} wood={wood} />
    </div>
  );

  function tx(v: { en: string; ar: string }) {
    return v[lang] || v.en;
  }
}

function StepTitle({ n, title, value }: { n: number; title: string; value?: string }) {
  return (
    <p className="mb-3 flex items-baseline gap-2 text-[0.88rem]">
      <span className="font-serif text-[1rem] text-faint" dir="ltr">0{n}</span>
      <span className="font-medium">{title}</span>
      {value && (
        <AnimatePresence mode="wait">
          <motion.span key={value} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-muted">
            · {value}
          </motion.span>
        </AnimatePresence>
      )}
    </p>
  );
}

/* ───────────── Samples request ───────────── */
function SamplesModal({ open, onClose, product, materials, initial, wood }: { open: boolean; onClose: () => void; product: Product; materials: Material[]; initial: string; wood: boolean }) {
  const { lang, t } = useSite();
  const ar = lang === "ar";
  const [picked, setPicked] = useState<string[]>([initial]);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [emirate, setEmirate] = useState("Dubai");
  const [pending, start] = useTransition();

  useEffect(() => {
    lockScroll(open);
    if (open) {
      setPicked([initial]);
      setDone(null);
      setErr(false);
    }
  }, [open, initial]);

  const all: { key: string; m: Material; c: Swatch }[] = materials.flatMap((m) => m.colours.map((c) => ({ key: `${m.id}:${c.id}`, m, c })));
  const find = (key: string) => all.find((x) => x.key === key);
  const toggle = (key: string) => setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : p.length >= 4 ? p : [...p, key]));
  const label = (key: string) => {
    const x = find(key);
    return x ? `${x.m.name[lang]} – ${x.c.name[lang]}` : key;
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal>
          <motion.div className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.55, ease: EASE }} className="relative flex max-h-[92vh] w-full max-w-2xl flex-col bg-white" data-lenis-prevent>
            <div className="flex items-start justify-between border-b border-line p-6">
              <div>
                <h3 className="font-display text-[1.4rem] font-semibold tracking-tight">{ar ? "عينات مجانية" : "Free fabric samples"}</h3>
                <p className="mt-1 text-[0.85rem] text-muted">{ar ? "اختر حتى 4 عينات لتراها وتلمسها في منزلك." : "Pick up to 4 swatches to see and feel at home."}</p>
              </div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-plate" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>

            {done ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="relative h-24 w-28">
                  <span className="absolute inset-x-0 bottom-0 h-16 bg-[#d8c3a5]" />
                  <span className="absolute inset-x-0 bottom-16 h-3 origin-bottom bg-[#c9b08d]" />
                  {picked.map((k, i) => (
                    <motion.span key={k} initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.12, type: "spring" }} className="absolute bottom-10 h-10 w-7 rounded-[4px] shadow" style={{ ...fabricStyle(find(k)?.c.hex ?? "#ccc", wood), left: 10 + i * 22 }} />
                  ))}
                </motion.div>
                <p className="mt-6 font-display text-[1.3rem] font-semibold">{ar ? "عيناتك في الطريق" : "Your samples are on their way"}</p>
                <p className="mt-1 text-[0.88rem] text-muted">{ar ? `رقم الطلب ${done}. نتواصل معك لتأكيد موعد التوصيل.` : `Reference ${done}. We'll call to confirm delivery.`}</p>
              </div>
            ) : (
              <form
                className="flex flex-1 flex-col overflow-y-auto"
                action={(fd) =>
                  start(async () => {
                    setErr(false);
                    const r = await requestSamples({
                      swatches: picked.map(label),
                      product: product.name.en,
                      name: String(fd.get("name") || ""),
                      phone: String(fd.get("phone") || ""),
                      email: String(fd.get("email") || ""),
                      emirate,
                      address: String(fd.get("address") || ""),
                    });
                    if (r.ok) setDone(r.number);
                    else setErr(true);
                  })
                }
              >
                <div className="space-y-5 p-6">
                  {materials.map((m) => (
                    <div key={m.id}>
                      <p className="mb-2 text-[0.8rem] font-medium">{m.name[lang]}</p>
                      <div className="flex flex-wrap gap-2.5">
                        {m.colours.map((c) => {
                          const key = `${m.id}:${c.id}`;
                          const on = picked.includes(key);
                          return (
                            <button type="button" key={key} onClick={() => toggle(key)} title={c.name[lang]} className={clsx("relative h-14 w-11 rounded-[6px] ring-offset-2 transition", on ? "ring-[1.5px] ring-ink" : "ring-1 ring-black/10 hover:-translate-y-0.5")} style={fabricStyle(c.hex, wood)}>
                              {on && <span className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"><Check className="h-3 w-3" /></span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sample box tray */}
                <div className="mx-6 flex items-center gap-3 bg-band p-3">
                  <Package className="h-5 w-5 shrink-0 stroke-[1.5]" />
                  <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => {
                      const k = picked[i];
                      return (
                        <span key={i} className="relative h-12 w-9 overflow-hidden rounded-[4px] border border-dashed border-ink/20">
                          <AnimatePresence>
                            {k && (
                              <motion.span key={k} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="absolute inset-0" style={fabricStyle(find(k)?.c.hex ?? "#ccc", wood)} />
                            )}
                          </AnimatePresence>
                        </span>
                      );
                    })}
                  </div>
                  <span className="ms-auto text-[0.8rem] text-muted tabular-nums">{picked.length}/4</span>
                </div>

                <div className="grid gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
                  <label className="block"><span className="text-[0.8rem] text-muted">{t("checkout.name")}</span><input name="name" required className="field" autoComplete="name" /></label>
                  <label className="block"><span className="text-[0.8rem] text-muted">{t("checkout.phone")}</span><input name="phone" required type="tel" dir="ltr" className="field" autoComplete="tel" /></label>
                  <label className="block"><span className="text-[0.8rem] text-muted">{t("checkout.email")}</span><input name="email" type="email" dir="ltr" className="field" autoComplete="email" /></label>
                  <label className="block">
                    <span className="text-[0.8rem] text-muted">{t("checkout.emirate")}</span>
                    <select value={emirate} onChange={(e) => setEmirate(e.target.value)} className="field">
                      {EMIRATES.map((e) => <option key={e} value={e}>{emirateName(e, lang)}</option>)}
                    </select>
                  </label>
                  <label className="block sm:col-span-2"><span className="text-[0.8rem] text-muted">{t("checkout.address")}</span><input name="address" required className="field" autoComplete="street-address" /></label>
                  {err && <p className="text-[0.85rem] text-red-700 sm:col-span-2">{t("common.error")}</p>}
                </div>

                <div className="mt-auto border-t border-line p-6">
                  <button disabled={pending || picked.length === 0} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.92rem] font-medium text-white disabled:opacity-40">
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {ar ? `أرسل ${picked.length} عينات مجاناً` : `Send me ${picked.length} free sample${picked.length === 1 ? "" : "s"}`}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
