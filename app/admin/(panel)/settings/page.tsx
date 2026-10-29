import { readDB } from "@/lib/db";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsAdmin() {
  const db = await readDB();
  return <SettingsForm settings={db.settings} />;
}
