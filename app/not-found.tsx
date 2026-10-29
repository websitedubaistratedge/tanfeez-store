import Link from "next/link";
import { Mark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink-950 px-5 text-center text-white">
      <div className="grid-lines absolute inset-0" />
      <div className="absolute -bottom-px -end-px h-48 w-48 bg-brand diag-tr md:h-80 md:w-80" />
      <Mark light className="relative h-16 w-auto" />
      <p className="relative mt-8 font-[family-name:var(--font-montserrat)] text-[28vw] font-black leading-none tracking-[-0.06em] text-white/10 md:text-[14rem]">404</p>
      <h1 className="relative -mt-6 text-2xl font-black uppercase md:text-4xl">This space isn&apos;t built yet.</h1>
      <p className="relative mt-3 text-white/60">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="relative mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-brand px-7 py-3.5 font-bold text-ink">Back home</Link>
        <Link href="/shop" className="rounded-full bg-white/10 px-7 py-3.5 font-bold">Visit the shop</Link>
      </div>
    </div>
  );
}
