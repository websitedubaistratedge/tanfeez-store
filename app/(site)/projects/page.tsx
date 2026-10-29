import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { ProjectsView } from "@/components/projects/ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
  description: "Fit-out and furniture projects for Galeries Lafayette, VOX Cinemas, Harvey Nichols, Corneliani and more across the UAE.",
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ sector?: string }> }) {
  const { sector } = await searchParams;
  return <ProjectsView projects={await getProjects()} initialSector={sector} />;
}
