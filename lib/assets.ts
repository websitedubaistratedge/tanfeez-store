import images from "./generated/public-images.json";

const known = new Set<string>(images);

/** Whether an optional image exists under public/ (see scripts/asset-manifest.mjs). */
export const hasImage = (src: string) => known.has(src);
