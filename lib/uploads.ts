import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { uid } from "./db";

// Uploaded photos and briefs are stored in Workers KV (free tier, no card needed),
// keyed by a random file name and served back through /api/uploads/[name].

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".pdf"]);
export const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export const extOf = (name: string) => {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i).toLowerCase();
};

export async function uploadStore(): Promise<KVNamespace | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as CloudflareEnv).UPLOADS ?? null;
  } catch {
    return null;
  }
}

// KV values are capped at 25 MB; keep uploads well under that.
export async function saveUpload(file: File, maxMB = 10): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > maxMB * 1024 * 1024) return null;
  const ext = extOf(file.name);
  if (!ALLOWED.has(ext)) return null;
  const kv = await uploadStore();
  if (!kv) return null;
  const name = `${uid()}${ext}`;
  await kv.put(name, await file.arrayBuffer());
  return `/api/uploads/${name}`;
}
