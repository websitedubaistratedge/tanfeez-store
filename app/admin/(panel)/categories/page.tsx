import { readDB } from "@/lib/db";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function CategoriesAdmin() {
  const db = await readDB();
  const counts = Object.fromEntries(db.categories.map((c) => [c.slug, db.products.filter((p) => p.category === c.slug).length]));
  return <CategoriesManager categories={[...db.categories].sort((a, b) => a.order - b.order)} counts={counts} />;
}
