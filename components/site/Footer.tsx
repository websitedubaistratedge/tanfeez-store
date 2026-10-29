"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { useSite } from "@/components/providers";
import { Logo } from "@/components/ui/Logo";
import { CircleArrow } from "@/components/ui/buttons";
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from "@/components/ui/icons";
import { subscribe } from "@/lib/actions";
import { Reveal } from "@/components/ui/motion";

export function Footer() {
  const { t, settings, lang } = useSite();
  const pathname = usePathname();
  const ar = lang === "ar";
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (pathname.startsWith("/admin")) return null;

  const shop = [
    ["sofas", "Sofas & lounge", "الكنب والجلسات"],
    ["beds", "Beds", "الأسرّة"],
    ["media", "TV & media walls", "جدران التلفاز"],
    ["storage", "Wardrobes", "الخزائن"],
    ["tables", "Tables", "الطاولات"],
  ];

  return (
    <footer className="bg-band text-ink no-print">
      <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-16 md:px-10 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="font-serif text-[2rem] leading-[1.1] md:text-[2.6rem]">{t("footer.news")}</p>
            {done ? (
              <p className="mt-8 border-b border-ink/20 pb-3 text-[0.95rem]">{t("footer.joined")}</p>
            ) : (
              <form
                className="mt-8 flex max-w-md items-center border-b border-ink/30 focus-within:border-ink"
                onSubmit={(e) => {
                  e.preventDefault();
                  start(async () => {
                    if ((await subscribe(email)).ok) setDone(true);
                  });
                }}
              >
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("footer.newsPh")} className="h-12 min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-ink/45" />
                <button disabled={pending} className="group flex items-center gap-2 text-[0.92rem] font-medium" aria-label={t("footer.join")}>
                  {t("footer.join")} <CircleArrow className="transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </button>
              </form>
            )}
            <div className="mt-8 flex gap-2">
              {[
                { href: `https://instagram.com/${settings.instagram}`, Icon: InstagramIcon, label: "Instagram" },
                { href: `https://wa.me/${settings.whatsapp}`, Icon: WhatsAppIcon, label: "WhatsApp" },
                { href: "https://www.linkedin.com", Icon: LinkedInIcon, label: "LinkedIn" },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition hover:border-ink hover:bg-ink hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h4 className="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">{t("footer.shop")}</h4>
              <ul className="space-y-3 text-[0.95rem]">
                {shop.map(([slug, en, a]) => (
                  <li key={slug}><Link href={`/shop?c=${slug}`} className="link-u">{ar ? a : en}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">{t("footer.explore")}</h4>
              <ul className="space-y-3 text-[0.95rem]">
                <li><Link href="/inspiration" className="link-u">{ar ? "إلهام" : "Inspiration"}</Link></li>
                <li><Link href="/business" className="link-u">{ar ? "للأعمال" : "For business"}</Link></li>
                {(["projects", "services", "about", "quote", "track"] as const).map((k) => (
                  <li key={k}><Link href={`/${k}`} className="link-u">{t(`nav.${k}`)}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">{t("footer.reach")}</h4>
              <ul className="space-y-3.5 text-[0.9rem] text-ink/80">
                <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5]" />{settings.address}</li>
                <li><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex gap-2.5 hover:text-ink" dir="ltr"><Phone className="h-4 w-4 stroke-[1.5]" />{settings.phone}</a></li>
                <li><a href={`tel:${settings.mobile.replace(/\s/g, "")}`} className="flex gap-2.5 hover:text-ink" dir="ltr"><Phone className="h-4 w-4 stroke-[1.5]" />{settings.mobile}</a></li>
                <li><a href={`mailto:${settings.email}`} className="flex gap-2.5 hover:text-ink"><Mail className="h-4 w-4 stroke-[1.5]" />{settings.email}</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-ink/10 pt-8 md:flex-row md:items-center">
          <Logo sub />
          <p className="text-[0.8rem] text-muted">
            © {new Date().getFullYear()} TANFEEZ Aamal Technical Contracting LLC. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
