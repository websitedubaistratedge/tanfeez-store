"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { login } from "@/lib/admin-actions";
import { Logo } from "@/components/ui/Logo";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div dir="ltr" className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 p-5">
      <div className="grid-lines absolute inset-0" />
      <div className="absolute end-[-10%] top-[-10%] h-[60vmin] w-[60vmin] rounded-full bg-brand/20 blur-[120px]" />
      <div className="absolute -bottom-px -end-px h-48 w-48 bg-brand diag-tr md:h-80 md:w-80" />
      <motion.form
        action={action}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm rounded-[28px] bg-white p-8 shadow-2xl"
      >
        <Logo />
        <h1 className="mt-8 text-2xl font-black tracking-tight">Admin panel</h1>
        <p className="mt-1 text-sm text-ink/55">Manage products, projects, orders and requests.</p>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-bold">Password</span>
          <input name="password" type="password" required autoFocus className="field" autoComplete="current-password" />
        </label>
        {state?.error && (
          <motion.p initial={{ x: -8 }} animate={{ x: [8, -6, 4, 0] }} className="mt-3 text-sm font-semibold text-red-600">
            {state.error}
          </motion.p>
        )}
        <button disabled={pending} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-bold text-white transition hover:bg-brand hover:text-ink">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in
        </button>
      </motion.form>
    </div>
  );
}
