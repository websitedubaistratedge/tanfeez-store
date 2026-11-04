import type { Metadata } from "next";
import { LegalView } from "@/components/pages/LegalView";

export const metadata: Metadata = { title: "Terms of sale" };

export default function TermsPage() {
  return <LegalView kind="terms" />;
}
