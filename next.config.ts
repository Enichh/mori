import type { NextConfig } from "next";

// Static export only on Netlify; dev mode uses normal server for fast refresh
const isExport = process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "*.anilist.co",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
    unoptimized: true,
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 384],
  },
  // Proxy anime APIs locally (Netlify handles this in prod via redirects)
  rewrites: async () => [
    {
      source: "/api/1anime/:path*",
      destination: "https://cdn-eu.1ani.me/:path*",
    },
    {
      source: "/api/reanime/:path*",
      destination: "https://reanime.to/api/:path*",
    },
    {
      source: "/api/sports/:path*",
      destination: "https://api.cdnlivetv.ru/api/v1/:path*",
    },
    {
      source: "/api/anilist",
      destination: "https://graphql.anilist.co",
    },
  ],
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
