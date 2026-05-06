import type { MetadataRoute } from "next";
import { TmdbService } from "@/services/tmdb";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mori.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tmdb = TmdbService.getInstance();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tv`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/anime`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pinoy`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/kdrama`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic movie routes
  const movieRoutes: MetadataRoute.Sitemap = [];
  try {
    const trending = await tmdb.movies.getTrending("week");
    for (const movie of trending.results.slice(0, 50)) {
      movieRoutes.push({
        url: `${BASE_URL}/movies/${movie.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // TMDB unavailable — skip dynamic routes
  }

  // Dynamic TV routes
  try {
    const tvTrending = await tmdb.tv.getTrending("week");
    for (const show of tvTrending.results.slice(0, 50)) {
      movieRoutes.push({
        url: `${BASE_URL}/tv/${show.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // skip
  }

  return [...staticRoutes, ...movieRoutes];
}
