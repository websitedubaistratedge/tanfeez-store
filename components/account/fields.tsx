"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

/** Underlined field with a small label, matching checkout. */
export function TextField({ label, className, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={clsx("block", className)}>
      <span className="text-[0.82rem] text-muted">
        {label}
        {rest.required && <span className="text-ink/40"> *</span>}
      </span>
      <input {...rest} className="field" />
    </label>
  );
}

export function PasswordField({ label, hint, className, ...rest }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <label className={clsx("block", className)}>
      <span className="flex items-baseline justify-between gap-2 text-[0.82rem] text-muted">
        <span>
          {label}
          {rest.required && <span className="text-ink/40"> *</span>}
        </span>
        {hint && <span className="text-[0.72rem] text-faint">{hint}</span>}
      </span>
      <span className="relative block">
        <input {...rest} type={show ? "text" : "password"} className="field pe-9" dir="ltr" />
        <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 end-0 flex w-9 items-center justify-end text-ink/35 transition hover:text-ink" aria-label={show ? "Hide password" : "Show password"} tabIndex={-1}>
          {show ? <EyeOff className="h-[18px] w-[18px] stroke-[1.5]" /> : <Eye className="h-[18px] w-[18px] stroke-[1.5]" />}
        </button>
      </span>
    </label>
  );
}

/** Square check box with an inner filled square, as on the design reference. */
export function Check({ children, className, ...rest }: { children: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={clsx("flex cursor-pointer items-start gap-3 text-[0.9rem] leading-snug text-ink-2", className)}>
      <input type="checkbox" {...rest} className="peer sr-only" />
      <span className="relative mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-ink/70 transition peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-checked:[&>span]:scale-100">
        <span className="h-2.5 w-2.5 scale-0 bg-ink transition-transform duration-200" />
      </span>
      <span>{children}</span>
    </label>
  );
}

/** Private / Company choice drawn as two square boxes. */
export function KindChoice({ value, onChange, ar }: { value: "private" | "company"; onChange: (v: "private" | "company") => void; ar: boolean }) {
  return (
    <div className="flex gap-7" role="radiogroup">
      {(["private", "company"] as const).map((k) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} onClick={() => onChange(k)} className="flex items-center gap-3 text-[0.95rem]">
          <span className={clsx("flex h-[18px] w-[18px] items-center justify-center border transition", value === k ? "border-ink" : "border-ink/40")}>
            <span className={clsx("h-2.5 w-2.5 bg-ink transition-transform duration-200", value === k ? "scale-100" : "scale-0")} />
          </span>
          {k === "private" ? (ar ? "فرد" : "Private") : ar ? "شركة" : "Company"}
        </button>
      ))}
    </div>
  );
}

const ERRORS: Record<string, [string, string]> = {
  name: ["Please enter your first and last name.", "يرجى إدخال الاسم الأول واسم العائلة."],
  email: ["Please enter a valid email address.", "يرجى إدخال بريد إلكتروني صحيح."],
  company: ["Please enter the company name.", "يرجى إدخال اسم الشركة."],
  short: ["The password needs at least 8 characters.", "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."],
  match: ["The two passwords don't match.", "كلمتا المرور غير متطابقتين."],
  terms: ["Please accept the terms to continue.", "يرجى الموافقة على الشروط للمتابعة."],
  exists: ["An account with this email already exists. Sign in instead.", "يوجد حساب بهذا البريد الإلكتروني. سجّل الدخول بدلاً من ذلك."],
  wrong: ["That email and password don't match.", "البريد الإلكتروني أو كلمة المرور غير صحيحة."],
  locked: ["Too many attempts. Please try again in 15 minutes.", "محاولات كثيرة. يرجى المحاولة بعد 15 دقيقة."],
  current: ["Your current password isn't right.", "كلمة المرور الحالية غير صحيحة."],
  signedOut: ["You've been signed out. Please sign in again.", "تم تسجيل خروجك. يرجى تسجيل الدخول مجدداً."],
};
export const errorText = (code: string, ar: boolean) => (ERRORS[code] ?? ["Something went wrong. Please try again.", "حدث خطأ. يرجى المحاولة مجدداً."])[ar ? 1 : 0];

