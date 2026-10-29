import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Instrument_Serif, Inter, Inter_Tight, Montserrat } from "next/font/google";
import { getLang } from "@/lib/lang";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter-tight", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400", "500", "600", "700"], variable: "--font-plex-ar", display: "swap" });
// Montserrat is kept only for the TANFEEZ wordmark, to match the logo lettering.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["800", "900"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://tanfeez.me"),
  title: {
    default: "TANFEEZ: Bespoke Furniture & Fit-out, Made in Dubai",
    template: "%s · TANFEEZ",
  },
  description:
    "Sofas, beds, media walls and joinery made to order in our Dubai workshop, and turnkey fit-out for retail, hospitality and homes across the UAE.",
  icons: { icon: "/brand/favicon.svg" },
  openGraph: { type: "website", siteName: "TANFEEZ", images: ["/images/craft/gloves-wide.jpg"] },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${inter.variable} ${interTight.variable} ${instrument.variable} ${plexAr.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
