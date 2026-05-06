// ---------------------------------------------------------------------------
// Mori ― Vidking default player configurations
// ---------------------------------------------------------------------------
import type { VidkingPlayerConfig } from '@/types/player';
import { DEFAULT_PLAYER_COLOR } from '@/lib/constants';

/** Default configuration for movie playback. */
export const defaultMovieConfig: Omit<VidkingPlayerConfig, 'tmdbId'> = {
  mediaType: 'movie',
  color: DEFAULT_PLAYER_COLOR,
  autoPlay: true,
  nextEpisode: false,
  episodeSelector: false,
  progress: 0,
};

/** Default configuration for TV / anime episode playback. */
export const defaultTVConfig: Omit<VidkingPlayerConfig, 'tmdbId' | 'season' | 'episode'> = {
  mediaType: 'tv',
  color: DEFAULT_PLAYER_COLOR,
  autoPlay: true,
  nextEpisode: true,
  episodeSelector: true,
  progress: 0,
};
