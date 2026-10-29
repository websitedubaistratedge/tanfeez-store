import type { Metadata } from "next";
import { TrackView } from "@/components/shop/TrackView";

export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n } = await searchParams;
  return <TrackView initial={n ?? ""} />;
}
