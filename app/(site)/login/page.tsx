import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthView } from "@/components/account/AuthView";
import { safeNext } from "@/lib/safe-next";
import { currentCustomer } from "@/lib/customers";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string }> }) {
  const { next, mode } = await searchParams;
  if (await currentCustomer()) redirect(safeNext(next));
  return <AuthView mode={mode === "create" ? "up" : "in"} next={next} />;
}
