import type { Metadata } from "next";
import { getActiveProducts, getCategories, getProjects } from "@/lib/data";
import { ShopView } from "@/components/shop/ShopView";

export const metadata: Metadata = {
  title: "Shop bespoke furniture",
  description: "Sofas, beds, media walls, wardrobes and joinery made in the TANFEEZ Dubai workshop. Delivered and installed across the UAE.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string; q?: string; w?: string }> }) {
  const { c, q, w } = await searchParams;
  const [products, categories, projects] = await Promise.all([getActiveProducts(), getCategories(), getProjects()]);
  // Category tiles use the first product's (studio) image of that category when available.
  const cats = categories.map((cat) => ({ ...cat, image: products.find((p) => p.category === cat.slug)?.images[0] ?? cat.image }));
  return (
    <ShopView
      products={products}
      categories={cats}
      editorial={projects.filter((p) => p.featured)}
      initialCategory={c ?? "all"}
      initialQuery={q ?? ""}
      wishlistOnly={w === "1"}
    />
  );
}
