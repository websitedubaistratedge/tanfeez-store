"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check as CheckIcon, KeyRound, Loader2, LogOut, Package, Trash2, UserRound } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { EASE } from "@/components/ui/motion";
import { CircleArrow, PillLink } from "@/components/ui/buttons";
import { changePassword, deleteMyAccount, signOut, updateProfile } from "@/lib/account-actions";
import { EMIRATES, emirateName, money } from "@/lib/i18n";
import type { AccountInfo, OrderStatus } from "@/lib/types";
import { Check, errorText, KindChoice, PasswordField, TextField } from "./fields";
import { BackButton } from "@/components/ui/BackButton";
import { useUrlState } from "@/lib/url-state";

export type AccountOrder = {
  number: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  items: { name: string; qty: number; image: string }[];
};

type Section = "orders" | "details" | "password";
const FLOW: OrderStatus[] = ["new", "confirmed", "production", "delivery", "delivered"];

export function AccountView({ me, since, orders, initial = "orders" }: { me: AccountInfo; since: string; orders: AccountOrder[]; initial?: Section }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const [section, setSection] = useUrlState<Section>("tab", "orders", ["orders", "details", "password"]);
  const [leaving, startLeave] = useTransition();
  const nav: { id: Section; label: string; Icon: typeof Package }[] = [
    { id: "orders", label: ar ? "طلباتي" : "My orders", Icon: Package },
    { id: "details", label: ar ? "بياناتي" : "My details", Icon: UserRound },
    { id: "password", label: ar ? "كلمة المرور" : "Password", Icon: KeyRound },
  ];
  const out = () =>
    startLeave(async () => {
      await signOut();
      router.replace("/");
      router.refresh();
    });
  const memberSince = new Date(since).toLocaleDateString(ar ? "ar-AE" : "en-GB", { month: "long", year: "numeric" });

  return (
    <>
      <section className="bg-band">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-5 pb-10 pt-10 md:px-10 md:pb-14 md:pt-14">
          <div>
            <BackButton className="mb-6" />
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="font-serif text-[1.35rem] leading-none text-ink-2 md:text-[1.39rem]">
              {ar ? "حسابي" : "My account"}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.9, ease: EASE }} className="mt-3 font-display text-[clamp(1.76rem,4vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              {ar ? `مرحباً، ${me.firstName}.` : `Hello, ${me.firstName}.`}
            </motion.h1>
            <p className="mt-3 text-[0.92rem] text-muted">
              <span dir="ltr">{me.email}</span> · {ar ? `عضو منذ ${memberSince}` : `Member since ${memberSince}`}
              {me.kind === "company" && me.company && <> · {me.company}</>}
            </p>
          </div>
          <button onClick={out} disabled={leaving} className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 px-5 text-[0.88rem] font-medium transition hover:border-ink hover:bg-ink hover:text-white disabled:opacity-50">
            {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 stroke-[1.6] rtl:-scale-x-100" />}
            {ar ? "تسجيل الخروج" : "Sign out"}
          </button>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-28 pt-8 md:px-10 md:pt-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        <nav className="grid grid-cols-3 gap-1.5 lg:sticky lg:top-28 lg:flex lg:flex-col lg:gap-2 lg:self-start">
          {nav.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={clsx(
                "relative flex items-center justify-center gap-2 rounded-full px-2 py-2.5 text-[0.86rem] transition sm:text-[0.92rem] lg:justify-start lg:gap-2.5 lg:rounded-xl lg:px-4 lg:py-3",
                section === id ? "text-white" : "text-ink/60 ring-1 ring-line hover:text-ink lg:ring-0 lg:hover:bg-plate"
              )}
            >
              {section === id && <motion.span layoutId="acct-nav" className="absolute inset-0 -z-10 rounded-full bg-ink lg:rounded-xl" transition={{ type: "spring", stiffness: 460, damping: 36 }} />}
              <Icon className="hidden h-4 w-4 stroke-[1.6] sm:block" />
              {label}
              {id === "orders" && orders.length > 0 && <span className={clsx("text-[0.75rem]", section === id ? "text-white/60" : "text-ink/40")}>{orders.length}</span>}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: EASE }} className="min-w-0">
            {section === "orders" && <Orders orders={orders} />}
            {section === "details" && <Details me={me} />}
            {section === "password" && (
              <div className="space-y-14">
                <Password />
                <DeleteAccount />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  );
}

function Orders({ orders }: { orders: AccountOrder[] }) {
  const { lang, t } = useSite();
  const ar = lang === "ar";
  if (!orders.length)
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <p className="font-serif text-[1.57rem]">{ar ? "لا توجد طلبات بعد" : "No orders yet"}</p>
        <p className="mx-auto mt-2 max-w-sm text-[0.92rem] text-muted">{ar ? "عند الطلب وأنت مسجّل الدخول، ستظهر طلباتك هنا مع حالتها." : "When you order while signed in, your orders appear here with their progress."}</p>
        <div className="mt-7"><PillLink href="/shop">{ar ? "تسوّق المجموعة" : "Explore the store"}</PillLink></div>
      </div>
    );
  return (
    <ul className="space-y-4">
      {orders.map((o) => {
        const step = FLOW.indexOf(o.status);
        return (
          <li key={o.number} className="rounded-2xl border border-line p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-[1.15rem] font-semibold" dir="ltr">{o.number}</p>
                <p className="text-[0.82rem] text-muted">{new Date(o.createdAt).toLocaleDateString(ar ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="text-end">
                <p className="text-[1.15rem] font-semibold">{money(o.total, lang)}</p>
                <span className={clsx("mt-1 inline-block rounded-full px-2.5 py-0.5 text-[0.74rem] font-medium", o.status === "cancelled" ? "bg-red-50 text-red-700" : o.status === "delivered" ? "bg-emerald-50 text-emerald-800" : "bg-brand-50 text-ink")}>
                  {t(`status.${o.status}`)}
                </span>
              </div>
            </div>
            {o.status !== "cancelled" && (
              <div className="mt-5 grid grid-cols-5 gap-1.5" aria-hidden>
                {FLOW.map((s, i) => (
                  <span key={s} className="h-1 overflow-hidden rounded-full bg-plate">
                    <motion.span className="block h-full bg-ink" initial={{ width: 0 }} animate={{ width: i <= step ? "100%" : 0 }} transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: EASE }} />
                  </span>
                ))}
              </div>
            )}
            <div className="mt-5 flex items-center gap-4">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {o.items.slice(0, 4).map((i, k) => (
                  <span key={k} className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-plate">
                    {i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}
                  </span>
                ))}
              </div>
              <p className="min-w-0 flex-1 truncate text-[0.88rem] text-ink-2">{o.items.map((i) => `${i.qty} × ${i.name}`).join(" · ")}</p>
              <Link href={`/track?n=${o.number}`} className="group inline-flex shrink-0 items-center gap-2 text-[0.88rem] font-medium">
                <span className="hidden sm:inline">{ar ? "التفاصيل" : "Details"}</span>
                <CircleArrow className="h-5 w-5 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function useSave(action: (fd: FormData) => Promise<{ ok: true } | { ok: false; error: string }>, after?: () => void) {
  const [state, setState] = useState<"idle" | "saved" | string>("idle");
  const [pending, start] = useTransition();
  const submit = (fd: FormData) =>
    start(async () => {
      const r = await action(fd);
      if (!r.ok) return setState(r.error);
      setState("saved");
      after?.();
      setTimeout(() => setState("idle"), 2200);
    });
  return { state, pending, submit };
}

function SaveRow({ state, pending, label }: { state: string; pending: boolean; label: string }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  return (
    <div className="flex flex-wrap items-center gap-4 pt-2">
      <button disabled={pending} className="inline-flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-full bg-ink px-7 text-[0.92rem] font-medium text-white transition hover:bg-ink-2 disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" && <CheckIcon className="h-4 w-4" />}
        {state === "saved" ? (ar ? "تم الحفظ" : "Saved") : label}
      </button>
      {state !== "idle" && state !== "saved" && <p className="text-[0.88rem] text-red-700" role="alert">{errorText(state, ar)}</p>}
    </div>
  );
}

function Details({ me }: { me: AccountInfo }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const [kind, setKind] = useState(me.kind);
  const [emirate, setEmirate] = useState(me.emirate || "Dubai");
  const { state, pending, submit } = useSave(updateProfile, () => router.refresh());
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("kind", kind);
        fd.set("emirate", emirate);
        submit(fd);
      }}
      className="max-w-2xl space-y-10"
    >
      <div className="space-y-6">
        <h2 className="font-display text-[1.3rem] font-semibold">{ar ? "البيانات الشخصية" : "Personal details"}</h2>
        <KindChoice value={kind} onChange={setKind} ar={ar} />
        {kind === "company" && <TextField label={ar ? "اسم الشركة" : "Company name"} name="company" defaultValue={me.company} autoComplete="organization" />}
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField label={ar ? "الاسم الأول" : "First name"} name="firstName" defaultValue={me.firstName} required autoComplete="given-name" />
          <TextField label={ar ? "اسم العائلة" : "Last name"} name="lastName" defaultValue={me.lastName} required autoComplete="family-name" />
          <TextField label={ar ? "رقم الجوال" : "Mobile number"} name="phone" type="tel" defaultValue={me.phone} autoComplete="tel" dir="ltr" />
          <label className="block">
            <span className="text-[0.82rem] text-muted">{ar ? "البريد الإلكتروني" : "Email"}</span>
            <input value={me.email} readOnly className="field text-ink/50" dir="ltr" />
          </label>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="font-display text-[1.3rem] font-semibold">{ar ? "عنوان التوصيل" : "Delivery address"}</h2>
          <p className="mt-1 text-[0.86rem] text-muted">{ar ? "نستخدمه لملء صفحة الدفع تلقائياً." : "We use it to fill in checkout for you."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {EMIRATES.map((e) => (
            <button type="button" key={e} onClick={() => setEmirate(e)} className={clsx("h-10 rounded-full border px-4 text-[0.88rem] transition", emirate === e ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
              {emirateName(e, lang)}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField label={ar ? "المنطقة" : "Area"} name="area" defaultValue={me.area} autoComplete="address-level2" />
          <TextField label={ar ? "العنوان" : "Address"} name="address" defaultValue={me.address} autoComplete="street-address" />
        </div>
        <Check name="marketing" defaultChecked={me.marketing}>{ar ? "أرسلوا لي النشرة الإخبارية والمجموعات الجديدة والعروض الخاصة عبر البريد الإلكتروني أو واتساب." : "Send me the TANFEEZ newsletter, new collections and private offers by email or WhatsApp."}</Check>
      </div>
      <SaveRow state={state} pending={pending} label={ar ? "حفظ التغييرات" : "Save changes"} />
    </form>
  );
}

function Password() {
  const { lang } = useSite();
  const ar = lang === "ar";
  const [key, setKey] = useState(0);
  const { state, pending, submit } = useSave(changePassword, () => setKey((k) => k + 1));
  return (
    <form key={key} onSubmit={(e) => { e.preventDefault(); submit(new FormData(e.currentTarget)); }} className="max-w-md space-y-6">
      <div>
        <h2 className="font-display text-[1.3rem] font-semibold">{ar ? "تغيير كلمة المرور" : "Change password"}</h2>
        <p className="mt-1 text-[0.86rem] text-muted">{ar ? "سيتم تسجيل خروجك من جميع الأجهزة الأخرى." : "You'll stay signed in here and be signed out on every other device."}</p>
      </div>
      <PasswordField label={ar ? "كلمة المرور الحالية" : "Current password"} name="current" required autoComplete="current-password" />
      <PasswordField label={ar ? "كلمة المرور الجديدة" : "New password"} hint={ar ? "8 أحرف على الأقل" : "8+ characters"} name="password" required minLength={8} autoComplete="new-password" />
      <PasswordField label={ar ? "تأكيد كلمة المرور الجديدة" : "Confirm new password"} name="confirm" required minLength={8} autoComplete="new-password" />
      <SaveRow state={state} pending={pending} label={ar ? "تحديث كلمة المرور" : "Update password"} />
    </form>
  );
}

function DeleteAccount() {
  const { lang } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="max-w-md border-t border-line pt-10">
      <h2 className="font-display text-[1.15rem] font-semibold">{ar ? "حذف الحساب" : "Delete account"}</h2>
      <p className="mt-1 text-[0.86rem] text-muted">
        {ar ? "يحذف بيانات حسابك وعنوانك المحفوظ. نحتفظ بسجلات الطلبات السابقة كما يتطلب القانون." : "Removes your login and saved details. We keep records of past orders, as the law requires."}
      </p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 text-[0.88rem] font-medium text-red-700 hover:underline">
          <Trash2 className="h-4 w-4" /> {ar ? "حذف حسابي" : "Delete my account"}
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              setError(null);
              const r = await deleteMyAccount(fd);
              if (!r.ok) return setError(r.error);
              router.replace("/");
              router.refresh();
            });
          }}
          className="mt-5 space-y-5 rounded-2xl bg-red-50/60 p-5"
        >
          <PasswordField label={ar ? "أدخل كلمة المرور للتأكيد" : "Enter your password to confirm"} name="password" required autoComplete="current-password" />
          {error && <p className="text-[0.86rem] text-red-700" role="alert">{errorText(error, ar)}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-red-700 px-6 text-[0.88rem] font-medium text-white transition hover:bg-red-800 disabled:opacity-60">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} {ar ? "حذف نهائي" : "Delete permanently"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-[0.88rem] text-muted hover:text-ink">{ar ? "إلغاء" : "Cancel"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
