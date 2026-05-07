// ---------------------------------------------------------------------------
// Mori ― VidPlay URL builder
// ---------------------------------------------------------------------------
import type { VidkingPlayerConfig } from "@/types/player";

/**
 * Build a VidPlay (vidsrc.cc) embed URL from a player config.
 *
 * Prefers IMDB ID when available; falls back to TMDB ID.
 * Always appends `?autoPlay=false`.
 *
 * @example
 *   // Movie with IMDB ID
 *   buildVidplayUrl({ tmdbId: 123, imdbId: "tt40999028", mediaType: "movie" })
 *   // → "https://vidsrc.cc/v2/embed/movie/tt40999028?autoPlay=false"
 *
 *   // TV with IMDB ID
 *   buildVidplayUrl({ tmdbId: 123, imdbId: "tt40999028", mediaType: "tv", season: 1, episode: 5 })
 *   // → "https://vidsrc.cc/v2/embed/tv/tt40999028/1/5?autoPlay=false"
 */
export function buildVidplayUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, imdbId, mediaType, season, episode } = config;
  const id = imdbId || String(tmdbId);
  const autoPlayParam = "?autoPlay=false";

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}${autoPlayParam}`;
  }

  return `https://vidsrc.cc/v2/embed/movie/${id}${autoPlayParam}`;
}
