import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { uid, UPLOAD_DIR } from "./db";

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

export async function saveUpload(file: File, maxMB = 10): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > maxMB * 1024 * 1024) return null;
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.has(ext)) return null;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${uid()}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${name}`;
}
