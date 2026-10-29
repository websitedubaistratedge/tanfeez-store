import { readDB } from "@/lib/db";
import { RequestsBoard } from "@/components/admin/RequestsBoard";

export default async function RequestsAdmin({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const { open } = await searchParams;
  const db = await readDB();
  return <RequestsBoard requests={db.requests} openId={open} />;
}
