import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { ProjectForm } from "@/components/admin/ProjectForm";
import type { Project } from "@/lib/types";

export default async function ProjectEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const blank: Project = {
    id: "",
    slug: "",
    client: "",
    title: { en: "", ar: "" },
    sector: "retail",
    scope: { en: "Fit-out", ar: "تجهيز داخلي" },
    location: { en: "", ar: "" },
    emirate: "Dubai",
    summary: { en: "", ar: "" },
    images: [],
    featured: false,
    order: 0,
    createdAt: "",
  };
  const project = id === "new" ? blank : db.projects.find((p) => p.id === id);
  if (!project) notFound();
  return <ProjectForm project={project} />;
}
