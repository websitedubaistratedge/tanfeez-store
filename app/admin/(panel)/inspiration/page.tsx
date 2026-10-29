import { readDB } from "@/lib/db";
import { LooksGrid } from "@/components/admin/LooksGrid";

export const metadata = { title: "Inspiration" };

export default async function InspirationAdmin() {
  const db = await readDB();
  const names = Object.fromEntries(db.products.map((p) => [p.id, p.name.en]));
  return <LooksGrid looks={db.looks} names={names} />;
}
