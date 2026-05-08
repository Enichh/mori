import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://morimovie.netlify.app",
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://morimovie.netlify.app/movies",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://morimovie.netlify.app/tv",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://morimovie.netlify.app/anime",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://morimovie.netlify.app/kdrama",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://morimovie.netlify.app/sports",
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];
}
