import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Reduce response size by removing the X-Powered-By header
  poweredByHeader: false,
  // Enable gzip/brotli compression (Netlify also compresses at the CDN level)
  compress: true,
  // Generate ETags for better CDN caching
  generateEtags: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    // Netlify free tier doesn't support next/image optimization.
    // Images are served directly from TMDB's CDN.
    unoptimized: true,
    // Cache image responses for 24 hours at the CDN level
    minimumCacheTTL: 86400,
  },
  experimental: {
    scrollRestoration: true,
    // Use lighter build output for Netlify (less bandwidth to deploy)
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
