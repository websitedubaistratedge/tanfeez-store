import type { Metadata } from "next";
import { LegalView } from "@/components/pages/LegalView";

export const metadata: Metadata = { title: "Returns & refunds" };

export default function ReturnsPage() {
  return <LegalView kind="returns" />;
}
