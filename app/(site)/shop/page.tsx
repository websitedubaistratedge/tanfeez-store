import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BUSINESS_CATEGORIES, getHomeCategories, getHomeProducts } from "@/lib/data";
import { ShopView } from "@/components/shop/ShopView";

export const metadata: Metadata = {
  title: "Shop bespoke furniture",
  description: "Sofas, beds, media walls, wardrobes and joinery made in the TANFEEZ Dubai workshop. Delivered and installed across the UAE.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string; q?: string; w?: string }> }) {
  const { c, q, w } = await searchParams;
  // Retail and commercial pieces live under For business.
  if (c && BUSINESS_CATEGORIES.has(c)) redirect("/business#pieces");
  const [products, categories] = await Promise.all([getHomeProducts(), getHomeCategories()]);
  // Category tiles use the first product's (studio) image of that category when available.
  const cats = categories.map((cat) => ({ ...cat, image: products.find((p) => p.category === cat.slug)?.images[0] ?? cat.image }));
  return (
    <ShopView
      key={`${c ?? "all"}|${q ?? ""}`} // a fresh view when the menu changes the category on the same page
      products={products}
      categories={cats}
      initialCategory={c ?? "all"}
      initialQuery={q ?? ""}
      wishlistOnly={w === "1"}
    />
  );
}
