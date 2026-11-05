import type { Metadata } from "next";
import { getBusinessProducts, getProjects } from "@/lib/data";
import { BusinessView } from "@/components/pages/BusinessView";

export const metadata: Metadata = {
  title: "For business · Fit-out & contract furniture",
  description: "Turnkey fit-out, joinery and contract furniture for retail, F&B, hospitality and workplace projects across the UAE.",
};

export default async function BusinessPage() {
  const [projects, pieces] = await Promise.all([getProjects(), getBusinessProducts()]);
  return <BusinessView projects={projects} pieces={pieces} />;
}
