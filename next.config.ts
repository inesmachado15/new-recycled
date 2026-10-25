import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.muchocartucho.net" },
      { protocol: "https", hostname: "muchocartucho.es" },
      { protocol: "https", hostname: "*.muchocartucho.net" },
    ],
  },
};

export default nextConfig;
