import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <LoginForm />;
}
