import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 72, 75, 78],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
