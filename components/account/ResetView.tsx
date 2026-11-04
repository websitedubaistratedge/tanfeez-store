"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSite } from "@/components/providers";
import { EASE } from "@/components/ui/motion";
import { resetPassword } from "@/lib/account-actions";
import { markWelcomed } from "@/components/site/WelcomeBack";
import { errorText, PasswordField } from "./fields";

/** Landing page of the emailed reset link: choose a new password, then you're signed in. */
export function ResetView({ token, valid }: { token: string; valid: boolean }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const [error, setError] = useState<string | null>(valid ? null : "expired");
  const [pending, start] = useTransition();

  return (
    <section className="flex min-h-[72vh] items-center justify-center bg-band px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="w-full max-w-[460px] rounded-3xl bg-white p-7 md:p-10">
        <p className="font-serif text-[1.25rem] leading-none text-ink-2">{ar ? "حسابك في تنفيذ" : "Your TANFEEZ account"}</p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.3rem)] font-semibold tracking-[-0.03em]">{ar ? "اختر كلمة مرور جديدة" : "Choose a new password"}</h1>
        {valid ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("token", token);
              start(async () => {
                setError(null);
                const r = await resetPassword(fd);
                if (!r.ok) return setError(r.error);
                markWelcomed();
                router.replace("/account");
                router.refresh();
              });
            }}
            className="mt-8 space-y-6"
          >
            <PasswordField label={ar ? "كلمة المرور الجديدة" : "New password"} hint={ar ? "8 أحرف على الأقل" : "8+ characters"} name="password" required minLength={8} autoComplete="new-password" autoFocus />
            <PasswordField label={ar ? "تأكيد كلمة المرور" : "Confirm password"} name="confirm" required minLength={8} autoComplete="new-password" />
            {error && <p className="text-[0.88rem] text-red-700" role="alert">{errorText(error, ar)}</p>}
            <button disabled={pending} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.95rem] font-medium text-white transition hover:bg-ink-2 disabled:opacity-60">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {ar ? "حفظ وتسجيل الدخول" : "Save and sign in"}
            </button>
            <p className="text-[0.8rem] text-faint">{ar ? "سيتم تسجيل خروجك من جميع الأجهزة الأخرى." : "You'll be signed out on every other device."}</p>
          </form>
        ) : (
          <div className="mt-6">
            <p className="text-[0.95rem] leading-relaxed text-muted">{errorText("expired", ar)}</p>
            <Link href="/login" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[0.92rem] font-medium text-white">{ar ? "طلب رابط جديد" : "Request a new link"}</Link>
          </div>
        )}
      </motion.div>
    </section>
  );
}
