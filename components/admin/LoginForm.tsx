"use client";

import Image from "next/image";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { login } from "@/lib/admin-actions";
import { Logo } from "@/components/ui/Logo";
import { CircleArrow } from "@/components/ui/buttons";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div dir="ltr" className="grid min-h-dvh bg-white lg:grid-cols-2">
      {/* A room from the collection, calm and full-bleed */}
      <div className="relative hidden overflow-hidden bg-plate lg:block">
        <motion.div className="absolute inset-0" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: EASE }}>
          <Image src="/images/lifestyle/hero.jpg" alt="" fill priority sizes="50vw" className="object-cover object-[65%_60%]" />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-10 pt-40 text-white">
          <p className="max-w-sm font-serif text-[1.7rem] leading-snug">Furniture &amp; interiors, beautifully executed.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.form
          action={action}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="w-full max-w-sm"
        >
          <Logo />
          <p className="mt-10 font-serif text-[1.3rem] leading-none text-ink-2">Back office</p>
          <h1 className="mt-1 font-display text-[2.2rem] font-semibold leading-none tracking-[-0.03em]">Sign in</h1>
          <p className="mt-3 text-[0.9rem] text-muted">Orders, products, projects and requests, all in one place.</p>
          <label className="mt-8 block">
            <span className="text-[0.8rem] text-muted">Password</span>
            <input name="password" type="password" required autoFocus className="field" autoComplete="current-password" />
          </label>
          {state?.error && (
            <motion.p initial={{ x: -8 }} animate={{ x: [8, -6, 4, 0] }} className="mt-3 text-[0.85rem] text-red-600">
              {state.error}
            </motion.p>
          )}
          <button disabled={pending} className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-ink text-[0.92rem] font-medium text-white transition hover:bg-ink-2 disabled:opacity-60">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <CircleArrow /></>}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
