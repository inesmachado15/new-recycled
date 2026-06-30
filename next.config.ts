import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.muchocartucho.net" },
      { protocol: "https", hostname: "muchocartucho.es" },
      { protocol: "https", hostname: "*.muchocartucho.net" },
    ],
  },
};

export default nextConfig;
