// ---------------------------------------------------------------------------
// Mori ― Vidking service types
// ---------------------------------------------------------------------------
import type { VidkingPlayerConfig } from '@/types/player';

export type { VidkingPlayerConfig };

/** Options that may be overridden when building a specific URL. */
export type VidkingOptions = Partial<Omit<VidkingPlayerConfig, 'tmdbId' | 'mediaType'>>;
