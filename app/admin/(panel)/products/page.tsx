import { readDB } from "@/lib/db";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function ProductsAdmin() {
  const db = await readDB();
  return <ProductsTable products={db.products} categories={db.categories} />;
}
