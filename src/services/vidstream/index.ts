// ---------------------------------------------------------------------------
// Mori ― VidStream URL builder
// ---------------------------------------------------------------------------
import type { VidkingPlayerConfig } from "@/types/player";

/**
 * Build a VidStream embed URL from a player config.
 *
 * Prefers IMDB ID when available; falls back to TMDB ID.
 *
 * @example
 *   // Movie with IMDB ID
 *   buildVidstreamUrl({ tmdbId: 123, imdbId: "tt40999028", mediaType: "movie" })
 *   // → "https://vidsrc.icu/embed/movie/tt40999028"
 *
 *   // TV with TMDB fallback
 *   buildVidstreamUrl({ tmdbId: 123, mediaType: "tv", season: 1, episode: 5 })
 *   // → "https://vidsrc.icu/embed/tv/123/1/5"
 */
export function buildVidstreamUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, imdbId, mediaType, season, episode } = config;
  const id = imdbId || String(tmdbId);

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`;
  }

  return `https://vidsrc.icu/embed/movie/${id}`;
}
