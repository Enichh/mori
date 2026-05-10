import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://morimovie.netlify.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/watch/"],
      crawlDelay: 1,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
