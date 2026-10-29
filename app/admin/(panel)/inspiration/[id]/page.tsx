import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { LookEditor, type PickerProduct } from "@/components/admin/LookEditor";
import type { Look } from "@/lib/types";

export const metadata = { title: "Room" };

export default async function LookEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const blank: Look = { id: "", title: { en: "", ar: "" }, mood: { en: "", ar: "" }, image: "", w: 1600, h: 900, pins: [], room: "living", home: false, live: true, createdAt: "" };
  const look = id === "new" ? blank : db.looks.find((l) => l.id === id);
  if (!look) notFound();
  const catName = (slug: string) => db.categories.find((c) => c.slug === slug)?.name.en ?? slug;
  const products: PickerProduct[] = db.products
    .filter((p) => p.status === "active")
    .map((p) => ({ id: p.id, name: p.name.en, image: p.images[0], category: catName(p.category), price: p.priceOnRequest ? null : p.salePrice || p.price }));
  return <LookEditor look={look} products={products} />;
}
