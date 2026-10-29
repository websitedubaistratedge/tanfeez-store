/**
 * Shrinks a photo in the browser before it is uploaded, so a 10 MB phone picture
 * arrives as a few hundred KB web-ready image. PDFs, GIFs and small files pass through.
 */
export async function shrinkImage(file: File, maxSide = 2000, quality = 0.85): Promise<File> {
  if (!/^image\/(jpeg|png|webp|heic|heif|avif)$/i.test(file.type) || file.size < 400 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const keepPng = file.type === "image/png"; // logos and cut-outs keep their transparency
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, keepPng ? "image/png" : "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    const name = keepPng ? file.name : file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: blob.type, lastModified: file.lastModified });
  } catch {
    return file; // e.g. a browser that cannot decode HEIC: upload the original
  }
}

export const shrinkImages = (files: File[]) => Promise.all(files.map((f) => shrinkImage(f)));
