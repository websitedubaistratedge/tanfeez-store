import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";
import { MIME } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-z0-9]+\.[a-z0-9]+$/i.test(name)) return new Response("Not found", { status: 404 });
  const ext = path.extname(name).toLowerCase();
  if (!MIME[ext]) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
