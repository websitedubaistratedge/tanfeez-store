import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default async function ProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const blank: Product = {
    id: "",
    slug: "",
    sku: "",
    name: { en: "", ar: "" },
    category: db.categories[0]?.slug ?? "",
    price: 0,
    salePrice: null,
    priceOnRequest: false,
    stock: 0,
    images: [],
    description: { en: "", ar: "" },
    materials: { en: "", ar: "" },
    dimensions: "",
    leadTimeDays: 14,
    finishes: [],
    sizes: [],
    featured: false,
    isNew: true,
    status: "active",
    rating: 5,
    reviews: 0,
    createdAt: "",
  };
  const product = id === "new" ? blank : db.products.find((p) => p.id === id);
  if (!product) notFound();
  return <ProductForm product={product} categories={db.categories} />;
}
