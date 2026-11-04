import type { Metadata } from "next";
import { ResetView } from "@/components/account/ResetView";
import { checkResetToken } from "@/lib/customers";

export const metadata: Metadata = { title: "Reset password", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const valid = !!(await checkResetToken(token));
  return <ResetView token={token} valid={valid} />;
}
