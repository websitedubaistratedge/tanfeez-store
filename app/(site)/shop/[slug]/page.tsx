import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveProducts, getCategories } from "@/lib/data";
import { ProductView } from "@/components/shop/ProductView";
import { roomsFor } from "@/lib/looks";
import { getLang } from "@/lib/lang";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getActiveProducts()).find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.name.en, description: p.description.en, openGraph: { images: [p.images[0]] } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [products, categories, lang] = await Promise.all([getActiveProducts(), getCategories(), getLang()]);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).concat(products.filter((p) => p.featured && p.category !== product.category)).slice(0, 4);
  const category = categories.find((c) => c.slug === product.category);
  return <ProductView product={product} related={related} category={category} rooms={roomsFor(product.slug, lang)} />;
}
