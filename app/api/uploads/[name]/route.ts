import { MIME, extOf, uploadStore } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-z0-9]+\.[a-z0-9]+$/i.test(name)) return new Response("Not found", { status: 404 });
  const ext = extOf(name);
  if (!MIME[ext]) return new Response("Not found", { status: 404 });
  const buf = await (await uploadStore())?.get(name, "arrayBuffer");
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(buf, {
    headers: {
      "Content-Type": MIME[ext],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
