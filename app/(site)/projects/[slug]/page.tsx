import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjects } from "@/lib/data";
import { CaseStudy } from "@/components/projects/CaseStudy";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProjects()).find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.client} · ${p.title.en}`, description: p.summary.en, openGraph: { images: [p.images[0]?.src] } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  return <CaseStudy project={projects[i]} next={projects[(i + 1) % projects.length]} />;
}
