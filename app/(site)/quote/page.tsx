import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { QuoteWizard } from "@/components/pages/QuoteWizard";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Tell TANFEEZ about your fit-out, furniture or technical project and get a tailored proposal within 48 hours.",
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ service?: string; product?: string }> }) {
  const { service, product } = await searchParams;
  const lang = await getLang();
  return (
    <>
      <PageHero overlap eyebrow={t(lang, "nav.quote")} title={[t(lang, "home.ctaTitle2")]} sub={t(lang, "quote.sub")} />
      <section className="relative px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-12">
          <div className="-mt-20 lg:col-span-8">
            <QuoteWizard initialService={service} product={product?.slice(0, 120)} />
          </div>
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-28 mt-10 space-y-4">
              <div className="relative aspect-[4/5] overflow-hidden ">
                <Image src="/images/projects/corneliani-1.jpg" alt="" fill sizes="30vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-sm font-medium text-brand">Corneliani · The Dubai Mall</p>
                  <p className="mt-2 text-lg font-medium leading-snug">{t(lang, "home.goal")}</p>
                </div>
                
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
