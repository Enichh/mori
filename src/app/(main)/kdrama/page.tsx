import type { Metadata } from "next";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import type { TVShow } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "KDrama 🇰🇷 | Mori",
  description:
    "Stream the most popular Korean dramas and TV shows. From romance to thriller, find your next KDrama obsession.",
};

export default async function KDramaPage() {
  const tmdb = TmdbService.getInstance();
  let kdramas: TVShow[] = [];
  let topRated: TVShow[] = [];

  try {
    const [kdramaData, topData] = await Promise.allSettled([
      tmdb.tv.getKDrama(),
      tmdb.tv.getKDrama(), // same for now, could be different sort
    ]);

    if (kdramaData.status === "fulfilled") {
      kdramas = kdramaData.value.results;
    }
    if (topData.status === "fulfilled") {
      topRated = topData.value.results;
    }
  } catch (e) {
    console.error("Failed to fetch KDrama:", e);
  }

  return (
    <div className="container-cine py-8">
      {/* Section label */}
      <div className="section-label mb-6">
        <span aria-hidden="true">[</span>
        <span>KOREAN DRAMA</span>
        <span aria-hidden="true">]</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
        KDrama <span className="text-primary">🇰🇷</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-10 max-w-2xl">
        Discover the best Korean dramas — from heart-wrenching romance to
        edge-of-your-seat thrillers. All powered by TMDB with multiple streaming
        servers.
      </p>

      {kdramas.length > 0 && (
        <MediaGrid
          title="Popular KDramas"
          items={kdramas.slice(0, 12)}
          mediaType="tv"
        />
      )}

      {kdramas.length > 12 && (
        <MediaGrid
          title="More KDramas"
          items={kdramas.slice(12, 24)}
          mediaType="tv"
        />
      )}

      {kdramas.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-heading">No KDramas found</p>
          <p className="text-sm mt-2">
            Try again later — the TMDB API may be rate-limited.
          </p>
        </div>
      )}
    </div>
  );
}
