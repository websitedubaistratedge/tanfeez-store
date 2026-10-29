import { readDB } from "@/lib/db";
import { ProjectsGrid } from "@/components/admin/ProjectsGrid";

export default async function ProjectsAdmin() {
  const db = await readDB();
  return <ProjectsGrid projects={[...db.projects].sort((a, b) => a.order - b.order)} />;
}
