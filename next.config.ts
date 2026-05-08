import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    unoptimized: true,
    minimumCacheTTL: 86400,
  },
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
