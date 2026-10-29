import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // Served straight from Cloudflare's CDN; on-the-fly resizing would need the paid Images plan.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;

// Gives `next dev` local D1 and KV bindings that mirror wrangler.jsonc.
initOpenNextCloudflareForDev();
