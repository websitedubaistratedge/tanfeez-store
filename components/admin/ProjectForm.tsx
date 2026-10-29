"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Btn, Card, Field, inputCls, PageHeader, Toggle } from "./ui";
import { ImageUploader } from "./ImageUploader";
import { deleteProject, saveProject } from "@/lib/admin-actions";
import { EMIRATES } from "@/lib/i18n";
import type { Project, ProjectImage, Sector } from "@/lib/types";

const SECTORS: { v: Sector; l: string }[] = [
  { v: "retail", l: "Retail" },
  { v: "fnb", l: "Food & Beverage" },
  { v: "office", l: "Office" },
  { v: "hospitality", l: "Hospitality" },
  { v: "residential", l: "Residential" },
  { v: "automotive", l: "Automotive" },
  { v: "accommodation", l: "Accommodation" },
];
const SCOPES = [
  { en: "Fit-out", ar: "تجهيز داخلي" },
  { en: "Furniture works", ar: "أعمال الأثاث" },
  { en: "Fit-out & furniture", ar: "تجهيز داخلي وأثاث" },
  { en: "Design & production", ar: "تصميم وإنتاج" },
  { en: "Technical works", ar: "أعمال فنية" },
];

const measure = (src: string) =>
  new Promise<ProjectImage>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ src, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ src, w: 1600, h: 1200 });
    img.src = src;
  });

export function ProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const [p, setP] = useState(project);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const isNew = !project.id;
  const set = <K extends keyof Project>(k: K, v: Project[K]) => setP((s) => ({ ...s, [k]: v }));

  const setImages = async (urls: string[]) => {
    const known = new Map(p.images.map((i) => [i.src, i]));
    const next = await Promise.all(urls.map((u) => known.get(u) ?? measure(u)));
    set("images", next);
  };

  const save = () => {
    setErr("");
    if (!p.client.trim()) return setErr("Client name is required.");
    if (!p.images.length) return setErr("Add at least one photo.");
    start(async () => {
      const { id } = await saveProject(p);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      if (isNew) router.replace(`/admin/projects/${id}`);
      else router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink/50 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Projects
      </Link>
      <PageHeader
        title={isNew ? "New project" : p.client}
        sub={isNew ? "Add a case study to the portfolio" : `/projects/${p.slug}`}
        actions={
          <>
            {!isNew && (
              <a href={`/projects/${p.slug}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 text-sm font-bold">
                <ExternalLink className="h-4 w-4" /> View
              </a>
            )}
            <Btn variant="brand" onClick={save} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
              {saved ? "Saved" : isNew ? "Create project" : "Save changes"}
            </Btn>
          </>
        }
      />
      {err && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-extrabold">Photos</h2>
            <ImageUploader value={p.images.map((i) => i.src)} onChange={setImages} />
          </Card>
          <Card className="space-y-4">
            <h2 className="font-extrabold">Story</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Client / brand"><input className={inputCls} value={p.client} onChange={(e) => set("client", e.target.value)} /></Field>
              <Field label="URL slug" hint="auto from client"><input className={inputCls} value={p.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
              <Field label="Project title (EN)"><input className={inputCls} value={p.title.en} onChange={(e) => set("title", { ...p.title, en: e.target.value })} placeholder="Flagship boutique" /></Field>
              <Field label="Project title (AR)"><input dir="rtl" className={inputCls} value={p.title.ar} onChange={(e) => set("title", { ...p.title, ar: e.target.value })} /></Field>
              <Field label="Summary (EN)" className="sm:col-span-2"><textarea rows={4} className={inputCls} value={p.summary.en} onChange={(e) => set("summary", { ...p.summary, en: e.target.value })} /></Field>
              <Field label="Summary (AR)" className="sm:col-span-2"><textarea dir="rtl" rows={4} className={inputCls} value={p.summary.ar} onChange={(e) => set("summary", { ...p.summary, ar: e.target.value })} /></Field>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="space-y-4">
            <h2 className="font-extrabold">Visibility</h2>
            <Toggle checked={p.featured} onChange={(v) => set("featured", v)} label="Feature on home page" />
          </Card>
          <Card className="space-y-4">
            <h2 className="font-extrabold">Classification</h2>
            <Field label="Sector">
              <select className={inputCls} value={p.sector} onChange={(e) => set("sector", e.target.value as Sector)}>
                {SECTORS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </Field>
            <Field label="Scope">
              <select className={inputCls} value={p.scope.en} onChange={(e) => set("scope", SCOPES.find((s) => s.en === e.target.value)!)}>
                {SCOPES.map((s) => <option key={s.en}>{s.en}</option>)}
              </select>
            </Field>
            <Field label="Emirate">
              <select className={inputCls} value={p.emirate} onChange={(e) => set("emirate", e.target.value)}>
                {EMIRATES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="Location (EN)"><input className={inputCls} value={p.location.en} onChange={(e) => set("location", { ...p.location, en: e.target.value })} placeholder="The Dubai Mall" /></Field>
            <Field label="Location (AR)"><input dir="rtl" className={inputCls} value={p.location.ar} onChange={(e) => set("location", { ...p.location, ar: e.target.value })} /></Field>
          </Card>
          {!isNew && (
            <Btn
              variant="danger"
              className="w-full"
              onClick={() =>
                confirm(`Delete "${p.client}"?`) &&
                start(async () => {
                  await deleteProject(p.id);
                  router.push("/admin/projects");
                })
              }
            >
              <Trash2 className="h-4 w-4" /> Delete project
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
