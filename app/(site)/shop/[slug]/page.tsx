import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveProducts, getCategories, getLooks, isBusinessProduct } from "@/lib/data";
import { ProductView } from "@/components/shop/ProductView";
import { roomsFor } from "@/lib/looks";
import { getLang } from "@/lib/lang";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ colour?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getActiveProducts()).find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.name.en, description: p.description.en, openGraph: { images: [p.images[0]] } };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const colour = (await searchParams)?.colour;
  const [products, categories, lang, looks] = await Promise.all([getActiveProducts(), getCategories(), getLang(), getLooks()]);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  // Suggestions stay on the same side: home pieces for home customers, retail pieces for business.
  const pool = products.filter((p) => isBusinessProduct(p) === isBusinessProduct(product));
  const related = pool.filter((p) => p.category === product.category && p.id !== product.id).concat(pool.filter((p) => p.featured && p.category !== product.category)).slice(0, 4);
  const category = categories.find((c) => c.slug === product.category);
  return <ProductView product={product} related={related} category={category} rooms={roomsFor(product.id, looks, lang)} colour={colour} />;
}
