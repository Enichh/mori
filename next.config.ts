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
