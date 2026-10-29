import { SiteProvider } from "@/components/providers";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { QuickView } from "@/components/shop/QuickView";
import { INTRO_SCRIPT, Preloader } from "@/components/site/Preloader";
import { getLang } from "@/lib/lang";
import { getPublicSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const settings = await getPublicSettings(lang);
  return (
    <SiteProvider lang={lang} settings={settings}>
      <Preloader />
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <SmoothScroll />
      {settings.announcement && (
        <div className="truncate bg-ink px-4 py-2 text-center text-[0.7rem] text-white/90 no-print sm:text-[0.78rem]">{settings.announcement}</div>
      )}
      <Header />
      <main className="relative">{children}</main>
      <Footer />
      <MobileTabBar />
      <CartDrawer />
      <QuickView />
      <WhatsAppFab />
    </SiteProvider>
  );
}
