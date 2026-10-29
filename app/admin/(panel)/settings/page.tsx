import { readDB } from "@/lib/db";
import { EMPTY_NOTIFY } from "@/lib/notify";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsAdmin() {
  const db = await readDB();
  return <SettingsForm settings={db.settings} notify={db.settings.notify ?? EMPTY_NOTIFY} />;
}
