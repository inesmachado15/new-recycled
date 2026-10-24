import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.muchocartucho.net" },
      { protocol: "https", hostname: "muchocartucho.es" },
      { protocol: "https", hostname: "*.muchocartucho.net" },
    ],
  },
  // App web Basket Stats (export do Expo em public/basket): os ficheiros
  // estáticos são servidos primeiro; as restantes rotas /basket/* abrem a app.
  async rewrites() {
    return [
      { source: "/basket", destination: "/basket/index.html" },
      { source: "/basket/:path*", destination: "/basket/index.html" },
    ];
  },
};

export default nextConfig;
