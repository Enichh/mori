// ---------------------------------------------------------------------------
// Mori ― Player / video types
// ---------------------------------------------------------------------------

/** Episode navigation data passed to the player for in-player episode selection. */
export interface EpisodeNavData {
  currentSeason: number;
  currentEpisode: number;
  totalSeasons: number;
  episodesPerSeason: Record<number, number>; // seasonNumber -> episodeCount
  onNavigate?: (season: number, episode: number) => void;
}

/** Configuration used to build a Vidking iframe embed URL. */
export interface VidkingPlayerConfig {
  tmdbId: number;
  imdbId?: string | null;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  /** Hex colour without the leading `#` (defaults to project lime). */
  color?: string;
  autoPlay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  progress?: number;
}

/** Normalised player event received via `postMessage`. */
export interface PlayerEvent {
  type: "PLAYER_EVENT";
  data: {
    event: "timeupdate" | "play" | "pause" | "ended" | "seeked";
    currentTime: number;
    duration: number;
    progress: number;
    id: string;
    mediaType: "movie" | "tv";
    season?: number;
    episode?: number;
    timestamp: number;
  };
}

/** Persisted watch-progress record (stored in `localStorage`). */
export interface WatchProgress {
  id: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  progress: number;
  currentTime: number;
  duration: number;
  updatedAt: number;
  /** Display-only fields saved alongside progress. */
  posterPath?: string | null;
  title?: string;
}

/** A single video source returned by the Vidhide API. */
export interface VidhideSource {
  url: string;
  quality: string;
  size: string;
  type: string;
}

export type PlayerServer =
  | "vidking"
  | "vidlink"
  | "vidstream"
  | "vidplay"
  | "superembed"
  | "superembed-vip"
  | "embedapi"
  | "mostream"
  | "twoembed"
  | "streamvault"
  | "ezvidapi"
  | "embedmaster"
  | "consumet";
