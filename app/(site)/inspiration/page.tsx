import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/data";
import { resolveLooks } from "@/lib/looks";
import { InspirationView } from "@/components/pages/InspirationView";

export const metadata: Metadata = {
  title: "Inspiration",
  description: "Shop real rooms styled by TANFEEZ: tap any piece to view it, or add the whole room to your bag.",
};

export default async function InspirationPage() {
  return <InspirationView looks={resolveLooks(await getActiveProducts())} />;
}
