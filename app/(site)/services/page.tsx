import type { Metadata } from "next";
import { ServicesView } from "@/components/pages/ServicesView";

export const metadata: Metadata = {
  title: "Services: Fit-out, Furniture Production & Technical Works",
  description: "Turnkey fit-out, bespoke furniture production and technical maintenance for retail, F&B, offices, hospitality and homes across the UAE.",
};

export default function ServicesPage() {
  return <ServicesView />;
}
