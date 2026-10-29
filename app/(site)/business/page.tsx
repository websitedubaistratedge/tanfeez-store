import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { BusinessView } from "@/components/pages/BusinessView";

export const metadata: Metadata = {
  title: "For business · Fit-out & contract furniture",
  description: "Turnkey fit-out, joinery and contract furniture for retail, F&B, hospitality and workplace projects across the UAE.",
};

export default async function BusinessPage() {
  return <BusinessView projects={await getProjects()} />;
}
