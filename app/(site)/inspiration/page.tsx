import type { Metadata } from "next";
import { getActiveProducts, getLooks } from "@/lib/data";
import { resolveLooks } from "@/lib/looks";
import { InspirationView } from "@/components/pages/InspirationView";

export const metadata: Metadata = {
  title: "Inspiration",
  description: "Shop real rooms styled by TANFEEZ: tap any piece to view it, or add the whole room to your bag.",
};

export default async function InspirationPage() {
  const [products, looks] = await Promise.all([getActiveProducts(), getLooks()]);
  return <InspirationView looks={resolveLooks(products, looks)} />;
}
