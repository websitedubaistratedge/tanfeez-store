import { readDB } from "@/lib/db";
import { DEFAULT_MATERIALS } from "@/lib/configurator";
import { FabricsEditor } from "@/components/admin/FabricsEditor";

export const metadata = { title: "Fabrics & finishes" };

export default async function FabricsAdmin() {
  const db = await readDB();
  return <FabricsEditor catalog={db.settings.materials ?? DEFAULT_MATERIALS} />;
}
