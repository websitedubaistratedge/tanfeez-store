"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw } from "lucide-react";
import { useSite } from "@/components/providers";
import { EASE } from "@/components/ui/motion";
import { OutlineLink, PillLink } from "@/components/ui/buttons";
import { useCart } from "@/lib/store";
import { Success } from "./CheckoutView";
import type { GatewayProvider, GatewayState } from "@/lib/types";

const NAME: Record<GatewayProvider, string> = { tabby: "Tabby", tamara: "Tamara", ziina: "Ziina" };

/** Back from the payment page: thank-you, "confirming…", or a friendly way to try again. */
export function PaymentReturn({ number, state, provider, hint }: { number: string; state: GatewayState; provider: GatewayProvider; hint: "success" | "cancel" | "failure" }) {
  const { lang } = useSite();
  const ar = lang === "ar";
  const router = useRouter();
  const clear = useCart((s) => s.clear);
  const [tries, setTries] = useState(0);
  const paid = state === "paid" || state === "authorized" || state === "refunded";

  useEffect(() => {
    if (paid) clear();
  }, [paid, clear]);

  // Some providers confirm a few seconds after the customer is sent back.
  useEffect(() => {
    if (state !== "pending" || hint !== "success" || tries >= 8) return;
    const id = setTimeout(() => {
      setTries((n) => n + 1);
      router.refresh();
    }, 2500);
    return () => clearTimeout(id);
  }, [state, hint, tries, router]);

  if (paid) return <Success number={number} />;

  const waiting = state === "pending" && hint === "success" && tries < 8;
  return (
    <section className="flex min-h-[72vh] items-center justify-center px-5 py-20 text-center">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="max-w-md">
        {waiting ? (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-ink/40" />
            <h1 className="mt-8 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold tracking-[-0.03em]">{ar ? "جارٍ تأكيد الدفع…" : "Confirming your payment…"}</h1>
            <p className="mt-3 text-muted">{ar ? `ننتظر تأكيد ${NAME[provider]}. لا تغلق هذه الصفحة.` : `We're waiting for ${NAME[provider]} to confirm. Please keep this page open.`}</p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plate">
              <RotateCcw className="h-6 w-6 stroke-[1.5]" />
            </span>
            <h1 className="mt-8 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold tracking-[-0.03em]">
              {state === "pending" ? (ar ? "لم يكتمل الدفع بعد" : "Payment not confirmed yet") : ar ? "لم تتم عملية الدفع" : "Payment wasn't completed"}
            </h1>
            <p className="mt-3 text-muted">
              {state === "pending"
                ? ar ? `إذا أكملت الدفع، سنؤكد طلبك ${number} قريباً ونتصل بك.` : `If you finished paying, we'll confirm order ${number} shortly and call you.`
                : ar ? `لم يتم خصم أي مبلغ. سلتك ما زالت محفوظة، يمكنك المحاولة مجدداً أو اختيار طريقة دفع أخرى.` : "Nothing was charged. Your bag is still saved, so you can try again or choose another way to pay."}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <PillLink href="/checkout">{ar ? "العودة إلى الدفع" : "Back to checkout"}</PillLink>
              <OutlineLink href="/contact">{ar ? "تحتاج مساعدة؟" : "Need help?"}</OutlineLink>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
