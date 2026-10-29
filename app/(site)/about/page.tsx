import type { Metadata } from "next";
import { AboutView } from "@/components/pages/AboutView";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "TANFEEZ Aamal Technical Contracting LLC: a Dubai fit-out and furniture company founded in 2021 on honesty and quality service.",
};

export default async function AboutPage() {
  return <AboutView projectCount={(await getProjects()).length} />;
}
