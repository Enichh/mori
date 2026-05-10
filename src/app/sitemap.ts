import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://morimovie.netlify.app";
const TMDB_KEY =
  process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/movies`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/tv`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/anime`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/drama`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/sports`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/dmca`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Try to add movie detail pages
  if (TMDB_KEY) {
    try {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}`,
      );
      if (movieRes.ok) {
        const movieData = await movieRes.json();
        for (const m of (movieData.results || []).slice(0, 30)) {
          entries.push({
            url: `${BASE_URL}/movies/${m.id}`,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      const tvRes = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}`,
      );
      if (tvRes.ok) {
        const tvData = await tvRes.json();
        for (const t of (tvData.results || []).slice(0, 30)) {
          entries.push({
            url: `${BASE_URL}/tv/${t.id}`,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    } catch {
      // Silent fail — static entries still returned
    }

    // Try anime from AniList
    try {
      const query = `query { Page(page: 1, perPage: 20) { media(type: ANIME, sort: TRENDING_DESC) { id } } }`;
      const anilistRes = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (anilistRes.ok) {
        const json = await anilistRes.json();
        for (const a of json.data?.Page?.media || []) {
          entries.push({
            url: `${BASE_URL}/anime/${a.id}`,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    } catch {
      // Silent fail
    }
  }

  return entries;
}
