// ---------------------------------------------------------------------------
// Mori ― Vidking player URL builder
// ---------------------------------------------------------------------------
import type { VidkingPlayerConfig } from "@/types/player";
import type { VidkingOptions } from "./types";
import { DEFAULT_PLAYER_COLOR, VIDKING_BASE_URL } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IVidkingService {
  /** Build a fully-qualified iframe embed URL from a config object. */
  buildUrl(config: VidkingPlayerConfig): string;
  /** Convenience — build a movie embed URL. */
  buildMovieUrl(tmdbId: number, options?: VidkingOptions): string;
  /** Convenience — build a TV episode embed URL. */
  buildTVUrl(
    tmdbId: number,
    season: number,
    episode: number,
    options?: VidkingOptions,
  ): string;
  /** Return a ready-to-use `<iframe>` HTML string. */
  buildEmbedHtml(config: VidkingPlayerConfig): string;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class VidkingService implements IVidkingService {
  private readonly baseUrl: string;
  private readonly defaultColor: string;

  constructor(baseUrl?: string, defaultColor?: string) {
    this.baseUrl = baseUrl ?? VIDKING_BASE_URL;
    this.defaultColor = defaultColor ?? DEFAULT_PLAYER_COLOR;
  }

  /** Build a fully-qualified iframe embed URL from a config object. */
  buildUrl(config: VidkingPlayerConfig): string {
    const {
      tmdbId,
      mediaType,
      season,
      episode,
      color = this.defaultColor,
      autoPlay = true,
      nextEpisode = false,
      episodeSelector = true,
      progress = 0,
    } = config;

    const params = new URLSearchParams();
    params.set("color", color);
    if (autoPlay) params.set("autoPlay", "true");
    if (nextEpisode) params.set("nextEpisode", "true");
    if (episodeSelector) params.set("episodeSelector", "true");
    if (progress > 0) params.set("progress", String(progress));

    if (mediaType === "tv" && season !== undefined && episode !== undefined) {
      return `${this.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}?${params.toString()}`;
    }

    return `${this.baseUrl}/embed/movie/${tmdbId}?${params.toString()}`;
  }

  /** Convenience — build a movie embed URL. */
  buildMovieUrl(tmdbId: number, options: VidkingOptions = {}): string {
    return this.buildUrl({
      tmdbId,
      mediaType: "movie",
      ...options,
    });
  }

  /** Convenience — build a TV episode embed URL. */
  buildTVUrl(
    tmdbId: number,
    season: number,
    episode: number,
    options: VidkingOptions = {},
  ): string {
    return this.buildUrl({
      tmdbId,
      mediaType: "tv",
      season,
      episode,
      ...options,
    });
  }

  /** Return a ready-to-use `<iframe>` HTML string. */
  buildEmbedHtml(config: VidkingPlayerConfig): string {
    const src = this.buildUrl(config);
    return [
      `<iframe`,
      `  src="${src}"`,
      `  width="100%"`,
      `  height="100%"`,
      `  frameborder="0"`,
      `  allow="autoplay; fullscreen"`,
      `  allowfullscreen`,
      `  referrerpolicy="no-referrer"`,
      `></iframe>`,
    ].join("\n");
  }
}
