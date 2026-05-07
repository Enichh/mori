// ---------------------------------------------------------------------------
// Mori ― VidLink URL builder
// ---------------------------------------------------------------------------
import type { VidkingPlayerConfig } from "@/types/player";

/**
 * Build a VidLink embed URL from a player config.
 *
 * Prefers IMDB ID when available; falls back to TMDB ID.
 *
 * @example
 *   // Movie with IMDB ID
 *   buildVidlinkUrl({ tmdbId: 123, imdbId: "tt40999028", mediaType: "movie" })
 *   // → "https://vidlink.pro/movie/tt40999028"
 *
 *   // TV with TMDB fallback
 *   buildVidlinkUrl({ tmdbId: 123, mediaType: "tv", season: 1, episode: 5 })
 *   // → "https://vidlink.pro/tv/123/1/5"
 */
export function buildVidlinkUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, imdbId, mediaType, season, episode } = config;
  const id = imdbId || String(tmdbId);

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
  }

  return `https://vidlink.pro/movie/${id}`;
}
