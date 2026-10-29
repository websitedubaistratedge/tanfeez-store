import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;
