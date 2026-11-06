"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { Check, CreditCard, Loader2, Lock, UserRound } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { cartTotal, useCart, useHydrated } from "@/lib/store";
import { EMIRATES, emirateName, money } from "@/lib/i18n";
import { placeOrder } from "@/lib/actions";
import { EASE } from "@/components/ui/motion";
import { CircleArrow, OutlineLink, PillLink } from "@/components/ui/buttons";
import { TabbyBadge, TamaraBadge } from "@/components/shop/Configurator";
import type { Order } from "@/lib/types";
import { BackButton } from "@/components/ui/BackButton";

export function CheckoutView() {
  const { t, lang, settings, account: me } = useSite();
  const ar = lang === "ar";
  const { items, clear } = useCart();
  const hydrated = useHydrated();
  const [emirate, setEmirate] = useState(me?.emirate || "Dubai");
  const [payment, setPayment] = useState<Order["payment"]>("tabby");
  const [error, setError] = useState<string | false>(false);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const subtotal = cartTotal(items);
  const fee = settings.deliveryFees[emirate] ?? 300;
  const delivery = subtotal >= settings.freeDeliveryOver ? 0 : fee;
  const total = subtotal + delivery;
  const vat = Math.round((total / 1.05) * 0.05);

  if (done) return <Success number={done} />;

  if (hydrated && items.length === 0) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <p className="font-serif text-[1.91rem]">{t("cart.empty")}</p>
        <p className="mt-2 text-muted">{t("cart.emptyD")}</p>
        <div className="mt-8"><PillLink href="/shop">{t("cart.continue")}</PillLink></div>
      </section>
    );
  }

  const submit = (fd: FormData) => {
    setError(false);
    start(async () => {
      const r = await placeOrder({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, finish: i.finish, size: i.size, material: i.material, colour: i.colour })),
        customer: {
          name: String(fd.get("name") || ""),
          phone: String(fd.get("phone") || ""),
          email: String(fd.get("email") || ""),
          emirate,
          area: String(fd.get("area") || ""),
          address: String(fd.get("address") || ""),
        },
        payment,
        notes: String(fd.get("notes") || ""),
        agreed: fd.get("agree") === "on",
      });
      if (r.ok && r.redirect) {
        // Off to Tabby / Tamara / Ziina. The bag is kept until the payment is confirmed.
        window.location.href = r.redirect;
        return;
      }
      if (r.ok) {
        clear();
        setDone(r.number);
        window.scrollTo({ top: 0 });
      } else setError(r.error);
    });
  };

  return (
    <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 md:px-10 md:pt-14">
      <BackButton fallback="/shop" className="mb-6" />
      <h1 className="mb-10 font-display text-[clamp(1.5rem,3.06vw,2.45rem)] font-semibold tracking-[-0.03em]">{t("checkout.title")}</h1>
      <form onSubmit={(e) => { e.preventDefault(); submit(new FormData(e.currentTarget)); }} className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-12 lg:col-span-7">
          <Step n={1} title={t("checkout.contact")}>
            {me ? (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-plate px-4 py-3 text-[0.88rem]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[0.75rem] font-semibold text-white">{me.firstName.charAt(0).toUpperCase()}</span>
                <span className="min-w-0 flex-1 truncate">
                  {ar ? "مسجّل الدخول باسم " : "Signed in as "}<b className="font-medium">{me.firstName} {me.lastName}</b>
                  <span className="text-muted"> · {ar ? "سيُحفظ الطلب في حسابك" : "this order is saved to your account"}</span>
                </span>
              </div>
            ) : (
              <Link href="/login?next=/checkout" className="group mb-6 flex items-center gap-3 rounded-2xl border border-line px-4 py-3 text-[0.88rem] transition hover:border-ink">
                <UserRound className="h-5 w-5 shrink-0 stroke-[1.5]" />
                <span className="min-w-0 flex-1">
                  {ar ? "لديك حساب؟ " : "Have an account? "}
                  <b className="font-medium underline underline-offset-2">{ar ? "سجّل الدخول" : "Sign in"}</b>
                  <span className="text-muted">{ar ? " لملء بياناتك تلقائياً، أو تابع كضيف." : " to fill this in for you, or continue as a guest."}</span>
                </span>
                <CircleArrow className="h-5 w-5 shrink-0 text-ink/40 transition group-hover:text-ink" />
              </Link>
            )}
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field label={t("checkout.name")} name="name" required autoComplete="name" defaultValue={me ? `${me.firstName} ${me.lastName}` : undefined} />
              <Field label={t("checkout.phone")} name="phone" required type="tel" autoComplete="tel" placeholder="+971 5x xxx xxxx" dir="ltr" defaultValue={me?.phone} />
              <div className="sm:col-span-2"><Field label={t("checkout.email")} name="email" type="email" required autoComplete="email" dir="ltr" defaultValue={me?.email} /></div>
            </div>
          </Step>

          <Step n={2} title={t("checkout.deliveryTo")}>
            <p className="mb-3 text-[0.82rem] text-muted">{t("checkout.emirate")}</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {EMIRATES.map((e) => (
                <button type="button" key={e} onClick={() => setEmirate(e)} className={clsx("h-10 rounded-full border px-4 text-[0.88rem] transition", emirate === e ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
                  {emirateName(e, lang)}
                </button>
              ))}
            </div>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field label={t("checkout.area")} name="area" required defaultValue={me?.area} />
              <Field label={t("checkout.address")} name="address" required autoComplete="street-address" defaultValue={me?.address} />
              <label className="sm:col-span-2">
                <span className="text-[0.82rem] text-muted">{t("checkout.notes")}</span>
                <textarea name="notes" rows={2} className="field resize-none" />
              </label>
            </div>
          </Step>

          <Step n={3} title={t("checkout.payment")}>
            <div className="border-t border-line">
              {([
                { id: "tabby", n: 4, badge: <TabbyBadge />, title: ar ? "ادفع على 4 دفعات" : "Pay in 4", d: ar ? `4 دفعات بدون فوائد بقيمة ${money(Math.ceil(total / 4), lang)}` : `4 interest-free payments of ${money(Math.ceil(total / 4), lang)}` },
                { id: "tamara", n: 3, badge: <TamaraBadge />, title: ar ? "ادفع على 3 دفعات" : "Pay in 3", d: ar ? `3 دفعات بدون فوائد بقيمة ${money(Math.ceil(total / 3), lang)}` : `3 interest-free payments of ${money(Math.ceil(total / 3), lang)}` },
                ...(settings.payments.card ? [{ id: "card", n: 0, badge: <CardBrands />, title: ar ? "بطاقة بنكية" : "Debit or credit card", d: ar ? "فيزا، ماستركارد، Apple Pay وGoogle Pay · دفع آمن عبر Ziina" : "Visa, Mastercard, Apple Pay & Google Pay · secured by Ziina" } as const] : []),
                { id: "cod", n: 0, badge: null, title: t("checkout.cod"), d: t("checkout.codD") },
                { id: "bank", n: 0, badge: null, title: t("checkout.bank"), d: t("checkout.bankD") },
              ] as const).map((o) => (
                <div key={o.id} className="border-b border-line">
                  <button type="button" onClick={() => setPayment(o.id)} className="flex w-full items-center gap-4 py-5 text-start">
                    <span className={clsx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition", payment === o.id ? "border-ink bg-ink" : "border-ink/30")}>
                      {payment === o.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-[0.95rem] font-medium">{o.title} {o.badge}</span>
                      <span className="block text-[0.85rem] text-muted tabular-nums">{o.d}</span>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {payment === o.id && o.n > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                        <Schedule n={o.n} total={total} provider={o.id === "tamara" ? "tamara" : "tabby"} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {!settings.payments.card && (
                <div className="flex items-center gap-4 border-b border-line py-5 text-faint">
                  <CreditCard className="h-5 w-5 stroke-[1.5]" />
                  <span className="flex-1 text-[0.95rem]">{t("checkout.online")}</span>
                  <span className="text-[0.75rem] uppercase tracking-[0.15em]">{t("checkout.soon")}</span>
                </div>
              )}
              {(payment === "card" || (payment === "tabby" && settings.payments.tabby) || (payment === "tamara" && settings.payments.tamara)) && (
                <p className="flex items-center gap-2 pt-4 text-[0.8rem] text-muted">
                  <Lock className="h-3.5 w-3.5" />
                  {ar ? "ستنتقل إلى صفحة الدفع الآمنة لإتمام العملية، ثم تعود إلى هنا." : "You'll finish on the provider's secure payment page, then come straight back here."}
                </p>
              )}
            </div>
          </Step>
        </div>

        <aside className="lg:col-span-5">
          <div className="bg-band p-6 md:p-8 lg:sticky lg:top-24">
            <h2 className="mb-6 font-display text-[1.2rem] font-semibold">{t("checkout.summary")}</h2>
            <ul className="max-h-[320px] space-y-4 overflow-y-auto" data-lenis-prevent>
              {hydrated &&
                items.map((i) => (
                  <li key={i.key} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-white">
                      <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.92rem]">{i.name[lang]}</p>
                      <p className="text-[0.78rem] text-muted">{i.qty} × {[i.finish, i.size].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className="text-[0.92rem] font-medium">{money(i.price * i.qty, lang)}</span>
                  </li>
                ))}
            </ul>
            <dl className="mt-6 space-y-2.5 border-t border-ink/10 pt-5 text-[0.9rem]">
              <Row k={t("cart.subtotal")} v={money(subtotal, lang)} />
              <Row k={`${t("checkout.delivery")} · ${emirateName(emirate, lang)}`} v={delivery === 0 ? t("checkout.free") : money(delivery, lang)} />
              <Row k={t("checkout.vat")} v={money(vat, lang)} muted />
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-5">
              <span className="font-medium">{t("checkout.total")}</span>
              <motion.span key={total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-[1.39rem] font-semibold">{money(total, lang)}</motion.span>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }} className="mt-4 text-[0.88rem] text-red-700">
                  {error === "tabby_rejected"
                    ? ar ? "لم تتمكن تابي من الموافقة على هذا الطلب. يرجى اختيار طريقة دفع أخرى." : "Tabby couldn't approve this order. Please choose another payment method."
                    : error === "tamara_rejected"
                      ? ar ? "لم تتمكن تمارا من الموافقة على هذا الطلب. يرجى اختيار طريقة دفع أخرى." : "Tamara couldn't approve this order. Please choose another payment method."
                      : error === "gateway"
                        ? ar ? "تعذّر الاتصال بمزوّد الدفع. حاول مجدداً أو اختر طريقة أخرى." : "We couldn't reach the payment provider. Please try again or choose another method."
                        : error === "terms"
                          ? ar ? "يرجى الموافقة على الشروط للمتابعة." : "Please accept the terms to continue."
                          : t("common.error")}
                </motion.p>
              )}
            </AnimatePresence>
            <label className="mt-6 flex cursor-pointer items-start gap-3 text-[0.84rem] leading-snug text-ink-2">
              <input type="checkbox" name="agree" required className="peer sr-only" />
              <span className="relative mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-ink/70 bg-white transition peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-checked:[&>span]:scale-100">
                <span className="h-2.5 w-2.5 scale-0 bg-ink transition-transform duration-200" />
              </span>
              <span>
                {ar ? "أوافق على " : "I agree to the "}
                <Link href="/terms" target="_blank" className="underline underline-offset-2">{ar ? "شروط البيع" : "Terms of sale"}</Link>
                {ar ? " و" : " and "}
                <Link href="/returns" target="_blank" className="underline underline-offset-2">{ar ? "سياسة الإرجاع" : "Returns policy"}</Link>
                {ar ? "، وأقرّ بقراءة " : ", and have read the "}
                <Link href="/privacy" target="_blank" className="underline underline-offset-2">{ar ? "سياسة الخصوصية" : "Privacy policy"}</Link>.
              </span>
            </label>
            <button disabled={pending || !hydrated} className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.95rem] font-medium text-white transition hover:bg-ink-2 disabled:opacity-60">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {payment === "card"
                ? ar
                  ? `ادفع ${money(total, lang)} بأمان`
                  : `Pay ${money(total, lang)} securely`
                : payment === "tabby" || payment === "tamara"
                ? ar
                  ? `ادفع ${money(Math.ceil(total / (payment === "tabby" ? 4 : 3)), lang)} اليوم`
                  : `Pay ${money(Math.ceil(total / (payment === "tabby" ? 4 : 3)), lang)} today`
                : t("checkout.place")}
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}

/* Instalment timeline: each dot fills like a pie as the plan completes. */
function Schedule({ n, total, provider }: { n: number; total: number; provider: "tabby" | "tamara" }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const amount = Math.ceil(total / n);
  const when = (i: number) => {
    if (i === 0) return ar ? "اليوم" : "Today";
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return d.toLocaleDateString(ar ? "ar-AE" : "en-GB", { day: "numeric", month: "short" });
  };
  const tint = provider === "tabby" ? "#3BFFC1" : "#E9A7D6";
  return (
    <div className="mb-5 ms-9 rounded-xl bg-plate/70 p-5">
      <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        <span className="absolute inset-x-[12%] top-[15px] h-px bg-ink/15" />
        <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.15 }} className="absolute inset-x-[12%] top-[15px] h-px origin-left bg-ink rtl:origin-right" />
        {Array.from({ length: n }, (_, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: EASE }} className="relative flex flex-col items-center text-center">
            <span className="relative h-[30px] w-[30px] rounded-full border border-ink bg-white">
              <motion.span
                className="absolute inset-[3px] rounded-full"
                initial={{ background: `conic-gradient(${tint} 0turn, transparent 0turn)` }}
                animate={{ background: `conic-gradient(${tint} ${(i + 1) / n}turn, transparent ${(i + 1) / n}turn)` }}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.8, ease: EASE }}
              />
            </span>
            <span className="mt-2 text-[0.9rem] font-semibold tabular-nums">{money(amount, lang)}</span>
            <span className="text-[0.75rem] text-muted">{when(i)}</span>
          </motion.li>
        ))}
      </ol>
      <p className="mt-4 text-center text-[0.78rem] text-muted">
        {ar ? "بدون فوائد أو رسوم · سيتم تحويلك لإتمام الموافقة" : `No interest, no fees · you'll confirm with ${provider} after placing the order`}
      </p>
    </div>
  );
}

function CardBrands() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <span className="rounded-[4px] border border-line bg-white px-1.5 py-px text-[0.62rem] font-bold italic tracking-tight text-[#1a1f71]">VISA</span>
      <span className="flex items-center rounded-[4px] border border-line bg-white px-1 py-[3px]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#eb001b]" />
        <span className="-ms-1 h-2.5 w-2.5 rounded-full bg-[#f79e1b] mix-blend-multiply" />
      </span>
      <span className="rounded-[4px] bg-ink px-1.5 py-px text-[0.62rem] font-semibold text-white"> Pay</span>
    </span>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: n * 0.08, ease: EASE, duration: 0.7 }}>
      <h2 className="mb-6 flex items-baseline gap-3 font-display text-[1.3rem] font-semibold">
        <span className="font-serif text-[1.3rem] font-normal text-faint" dir="ltr">0{n}</span>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[0.82rem] text-muted">{label}</span>
      <input {...rest} className="field" />
    </label>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className={clsx("flex justify-between", muted && "text-muted")}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

export function Success({ number }: { number: string }) {
  const { t, lang, account } = useSite();
  return (
    <section className="flex min-h-[78vh] items-center justify-center px-5 py-20 text-center">
      <div>
        <svg viewBox="-10 -10 257 184" className="mx-auto h-16 w-auto overflow-visible">
          <path d="M103 0 160 57 133 84 103 54 26 131 0 105 31 74 31 32 56 32 56 47Z" fill="#1a1a1a" />
          <motion.path d="M210 34 237 61 134 164 76 106 103 79 134 110Z" fill="#FFCB06" initial={{ scale: 1.8, opacity: 0, x: 30, y: -30 }} animate={{ scale: 1, opacity: 1, x: 0, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.3 }} style={{ transformOrigin: "150px 110px" }} />
        </svg>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: EASE }} className="mt-10 font-display text-[clamp(1.29rem,2.72vw,2.04rem)] font-semibold tracking-[-0.03em]">
          {t("checkout.thanks")}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mx-auto mt-3 max-w-md font-serif text-[1.15rem] text-ink-2">
          {t("checkout.thanksD")}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mx-auto mt-8 inline-flex items-center gap-3 border-y border-line px-6 py-4">
          <Check className="h-4 w-4" />
          <span className="text-[0.85rem] text-muted">{t("checkout.orderNo")}</span>
          <span className="font-display text-[1.2rem] font-semibold" dir="ltr">{number}</span>
        </motion.div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <PillLink href={account ? "/account" : `/track?n=${number}`}>{account ? (lang === "ar" ? "طلباتي" : "View in my account") : t("checkout.track")}</PillLink>
          <OutlineLink href="/shop">{t("cart.continue")}</OutlineLink>
        </div>
      </div>
    </section>
  );
}

