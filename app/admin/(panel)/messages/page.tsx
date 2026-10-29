import { readDB } from "@/lib/db";
import { MessagesInbox } from "@/components/admin/MessagesInbox";

export default async function MessagesAdmin() {
  const db = await readDB();
  return <MessagesInbox messages={db.messages} />;
}
