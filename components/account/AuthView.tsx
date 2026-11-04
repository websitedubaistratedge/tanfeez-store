"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin, PackageCheck, Zap } from "lucide-react";
import clsx from "clsx";
import { useSite } from "@/components/providers";
import { EASE } from "@/components/ui/motion";
import { signIn, signUp } from "@/lib/account-actions";
import { Check, errorText, KindChoice, PasswordField, TextField } from "./fields";
import { safeNext } from "@/lib/safe-next";
import { markWelcomed } from "@/components/site/WelcomeBack";

type Tab = "in" | "up";

/** Sign in (warm panel) beside Create an account; on phones the two share a sliding tab. */
export function AuthView({ mode, next }: { mode: Tab; next?: string }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const [tab, setTab] = useState<Tab>(mode);

  return (
    <section className="mx-auto max-w-[1440px] lg:px-10 lg:py-10">
      {/* Phone / tablet: heading + tabs */}
      <div className="px-5 pt-8 md:px-10 lg:hidden">
        <p className="font-serif text-[1.35rem] leading-none text-ink-2">{ar ? "حسابك في تنفيذ" : "Your TANFEEZ account"}</p>
        <div className="relative mt-6 grid grid-cols-2 border-b border-line">
          {(["in", "up"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} className={clsx("relative pb-3.5 text-[1.02rem] font-medium transition-colors", tab === k ? "text-ink" : "text-ink/40")}>
              {k === "in" ? (ar ? "تسجيل الدخول" : "Sign in") : ar ? "إنشاء حساب" : "Create account"}
              {tab === k && <motion.span layoutId="auth-tab" className="absolute inset-x-6 -bottom-px h-[2px] rounded-full bg-ink" transition={{ type: "spring", stiffness: 480, damping: 38 }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:min-h-[640px] lg:grid-cols-2">
        <div className={clsx("bg-band lg:flex", tab === "in" ? "flex" : "hidden")}>
          <Panel k={tab === "in" ? "in" : "in-static"}>
            <SignIn next={next} />
          </Panel>
        </div>
        <div className={clsx("bg-white lg:flex", tab === "up" ? "flex" : "hidden")}>
          <Panel k={tab === "up" ? "up" : "up-static"}>
            <SignUp next={next} onSignIn={() => setTab("in")} />
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mx-auto flex w-full max-w-[520px] flex-col px-5 pb-14 pt-7 md:px-10 lg:py-16">
      {children}
    </motion.div>
  );
}

function Err({ code }: { code: string | null }) {
  const { lang } = useSite();
  return (
    <AnimatePresence>
      {code && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden text-[0.88rem] text-red-700" role="alert">
          <span className="block pt-1">{errorText(code, lang === "ar")}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Submit({ pending, children, className }: { pending: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button disabled={pending} className={clsx("inline-flex h-[52px] min-w-[180px] items-center justify-center gap-2 rounded-full bg-ink px-8 text-[0.95rem] font-medium text-white transition hover:bg-ink-2 disabled:opacity-60", className)}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function SignIn({ next }: { next?: string }) {
  const { lang, settings } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);
  const [pending, start] = useTransition();

  const submit = (fd: FormData) =>
    start(async () => {
      setError(null);
      const r = await signIn(fd);
      if (!r.ok) return setError(r.error);
      markWelcomed();
      router.replace(safeNext(next));
      router.refresh();
    });

  return (
    <>
      <h1 className="font-display text-[clamp(1.9rem,3vw,2.5rem)] font-semibold tracking-[-0.03em] max-lg:sr-only">{ar ? "تسجيل الدخول" : "Sign in"}</h1>
      <p className="text-[0.95rem] text-muted lg:mt-2">{ar ? "مرحباً بعودتك. تابع طلباتك وأكمل الشراء بسرعة." : "Welcome back. Follow your orders and check out faster."}</p>
      <form onSubmit={(e) => { e.preventDefault(); submit(new FormData(e.currentTarget)); }} className="mt-9 space-y-7">
        <TextField label={ar ? "البريد الإلكتروني" : "Email"} name="email" type="email" required autoComplete="email" dir="ltr" />
        <div>
          <PasswordField label={ar ? "كلمة المرور" : "Password"} name="password" required autoComplete="current-password" />
          <button type="button" onClick={() => setForgot(!forgot)} className="link-u mt-3 text-[0.88rem] text-ink-2">
            {ar ? "نسيت كلمة المرور؟" : "Forgot your password?"}
          </button>
          <AnimatePresence>
            {forgot && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden text-[0.86rem] text-muted">
                <span className="mt-3 block rounded-xl bg-white/70 p-4">
                  {ar ? "راسلنا على واتساب ببريدك الإلكتروني وسنرسل لك كلمة مرور مؤقتة." : "Message us on WhatsApp with your account email and we'll send you a temporary password."}{" "}
                  <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(ar ? "مرحباً، نسيت كلمة مرور حسابي" : "Hello, I forgot my account password")}`} target="_blank" rel="noreferrer" className="font-medium text-ink underline underline-offset-2">
                    WhatsApp
                  </a>
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <Err code={error} />
        <div className="flex flex-wrap items-center justify-between gap-5 pt-2">
          <Check name="remember" defaultChecked>{ar ? "تذكرني" : "Remember me"}</Check>
          <Submit pending={pending}>{ar ? "دخول" : "Sign in"}</Submit>
        </div>
      </form>

      <ul className="mt-auto grid grid-cols-3 gap-3 border-t border-ink/10 pt-8 text-[0.8rem] leading-snug text-ink-2 max-lg:mt-12 sm:text-[0.86rem]">
        {[
          { Icon: PackageCheck, t: ar ? "تتبع كل طلباتك" : "Track every order" },
          { Icon: Zap, t: ar ? "إتمام شراء أسرع" : "Faster checkout" },
          { Icon: MapPin, t: ar ? "عنوانك محفوظ" : "Your address saved" },
        ].map(({ Icon, t }) => (
          <li key={t} className="flex flex-col items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white"><Icon className="h-4 w-4 stroke-[1.5]" /></span>
            {t}
          </li>
        ))}
      </ul>
    </>
  );
}

function SignUp({ next, onSignIn }: { next?: string; onSignIn: () => void }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const [kind, setKind] = useState<"private" | "company">("private");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (fd: FormData) =>
    start(async () => {
      setError(null);
      fd.set("kind", kind);
      const r = await signUp(fd);
      if (!r.ok) return setError(r.error);
      markWelcomed();
      router.replace(safeNext(next));
      router.refresh();
    });

  return (
    <>
      <h2 className="font-display text-[clamp(1.9rem,3vw,2.5rem)] font-semibold tracking-[-0.03em] max-lg:sr-only">{ar ? "إنشاء حساب" : "Create an account"}</h2>
      <p className="text-[0.95rem] text-muted lg:mt-2">{ar ? "دقيقة واحدة، وتصبح كل طلباتك في مكان واحد." : "One minute, and all your orders live in one place."}</p>
      <form onSubmit={(e) => { e.preventDefault(); submit(new FormData(e.currentTarget)); }} className="mt-8 space-y-6">
        <KindChoice value={kind} onChange={setKind} ar={ar} />
        <AnimatePresence initial={false}>
          {kind === "company" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
              <TextField label={ar ? "اسم الشركة" : "Company name"} name="company" required autoComplete="organization" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-6">
          <TextField label={ar ? "الاسم الأول" : "First name"} name="firstName" required autoComplete="given-name" />
          <TextField label={ar ? "اسم العائلة" : "Last name"} name="lastName" required autoComplete="family-name" />
        </div>
        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
          <TextField label={ar ? "البريد الإلكتروني" : "Email"} name="email" type="email" required autoComplete="email" dir="ltr" />
          <TextField label={ar ? "رقم الجوال" : "Mobile number"} name="phone" type="tel" autoComplete="tel" placeholder="+971 5x xxx xxxx" dir="ltr" />
        </div>
        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
          <PasswordField label={ar ? "كلمة المرور" : "Password"} hint={ar ? "8 أحرف على الأقل" : "8+ characters"} name="password" required minLength={8} autoComplete="new-password" />
          <PasswordField label={ar ? "تأكيد كلمة المرور" : "Confirm password"} name="confirm" required minLength={8} autoComplete="new-password" />
        </div>
        <div className="space-y-4 pt-1">
          <Check name="terms" required>
            {ar ? "أوافق على شروط البيع وسياسة الخصوصية لدى تنفيذ." : "I agree to TANFEEZ's terms of sale and privacy policy."}
          </Check>
          <Check name="marketing">
            {ar ? "نعم، أرسلوا لي النشرة الإخبارية والمجموعات الجديدة والعروض الخاصة عبر البريد الإلكتروني أو واتساب." : "Yes, send me the TANFEEZ newsletter, new collections and private offers by email or WhatsApp."}
            <span className="mt-0.5 block text-[0.78rem] text-faint">{ar ? "يمكنك تغيير ذلك في أي وقت من حسابك." : "You can change this anytime in your account."}</span>
          </Check>
        </div>
        <Err code={error} />
        <div className="flex flex-wrap items-center justify-between gap-5 pt-2">
          <button type="button" onClick={onSignIn} className="text-[0.88rem] text-muted lg:hidden">
            {ar ? "لديك حساب؟ " : "Already have an account? "}
            <span className="font-medium text-ink underline underline-offset-2">{ar ? "سجّل الدخول" : "Sign in"}</span>
          </button>
          <Submit pending={pending} className="ms-auto">{ar ? "إنشاء الحساب" : "Create account"}</Submit>
        </div>
        <p className="text-[0.78rem] text-faint">
          {ar ? "يمكنك دائماً الطلب كضيف دون حساب. " : "You can always order as a guest without an account. "}
          <Link href="/shop" className="underline underline-offset-2">{ar ? "تابع التسوق" : "Continue shopping"}</Link>
        </p>
      </form>
    </>
  );
}
