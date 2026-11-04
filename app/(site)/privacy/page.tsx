import type { Metadata } from "next";
import { LegalView } from "@/components/pages/LegalView";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return <LegalView kind="privacy" />;
}
