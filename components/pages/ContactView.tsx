"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { useSite } from "@/components/providers";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/ui/motion";
import { CircleArrow } from "@/components/ui/buttons";
import { sendMessage } from "@/lib/actions";

export function ContactView() {
  const { t, settings, lang } = useSite();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();

  const rows = [
    { k: t("contact.call"), v: [settings.phone, settings.mobile], href: `tel:${settings.mobile.replace(/\s/g, "")}`, ltr: true },
    { k: lang === "ar" ? "واتساب" : "WhatsApp", v: [settings.mobile], href: `https://wa.me/${settings.whatsapp}`, ltr: true },
    { k: lang === "ar" ? "البريد الإلكتروني" : "Email", v: [settings.email], href: `mailto:${settings.email}` },
    { k: t("contact.visit"), v: [settings.address] },
    { k: t("contact.hours"), v: [settings.hours] },
  ];

  return (
    <>
      <PageHero eyebrow={t("nav.contact")} title={[t("contact.title")]} sub={t("contact.sub")} />
      <section className="mx-auto grid max-w-[1440px] gap-14 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-12">
        <dl className="lg:col-span-5">
          {rows.map((r, i) => (
            <Reveal key={r.k} delay={i * 0.05} className="grid grid-cols-[110px_1fr] gap-4 border-t border-line py-5 last:border-b">
              <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-muted">{r.k}</dt>
              <dd className="text-[1rem]">
                {r.v.map((v) =>
                  r.href ? (
                    <a key={v} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="link-u block w-fit" dir={r.ltr ? "ltr" : undefined}>
                      {v}
                    </a>
                  ) : (
                    <span key={v} className="block">{v}</span>
                  )
                )}
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[380px] flex-col items-start justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white"><Check className="h-6 w-6" /></span>
                <p className="mt-6 max-w-md font-serif text-[1.8rem] leading-snug">{t("contact.sent")}</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0 }}
                action={(fd) =>
                  start(async () => {
                    const r = await sendMessage(fd);
                    if (r.ok) setSent(true);
                    else setError(true);
                  })
                }
                className="grid gap-x-8 gap-y-6 sm:grid-cols-2"
              >
                <Field label={t("contact.name")} name="name" required />
                <Field label={t("checkout.email")} name="email" type="email" required dir="ltr" />
                <Field label={t("checkout.phone")} name="phone" type="tel" dir="ltr" />
                <Field label={t("contact.subject")} name="subject" />
                <label className="sm:col-span-2">
                  <span className="text-[0.82rem] text-muted">{t("contact.message")}</span>
                  <textarea name="message" required rows={5} className="field resize-none" />
                </label>
                {error && <p className="text-sm text-red-600 sm:col-span-2">{t("common.error")}</p>}
                <button disabled={pending} className="group inline-flex h-[52px] items-center gap-3 justify-self-start rounded-full bg-ink px-7 text-[0.92rem] font-medium text-white transition hover:bg-ink-2 sm:col-span-2">
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {pending ? t("common.sending") : t("contact.send")}
                  {!pending && <CircleArrow />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Reveal className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10">
        <div className="relative h-[420px] overflow-hidden bg-plate">
          <iframe
            title={lang === "ar" ? "موقع ورشة تنفيذ" : "TANFEEZ workshop location"}
            src="https://maps.google.com/maps?q=Dubai%20Investment%20Park%202&z=14&output=embed"
            className="h-full w-full grayscale"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>
    </>
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
