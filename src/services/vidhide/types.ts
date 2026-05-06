// ---------------------------------------------------------------------------
// Mori ― Vidhide service types
// ---------------------------------------------------------------------------
import type { VidhideSource } from '@/types/player';

export type { VidhideSource };

/** Parameters for searching a movie on Vidhide. */
export interface VidhideMovieSearch {
  title: string;
  year?: number;
}

/** Parameters for searching a TV episode on Vidhide. */
export interface VidhideTVSearch {
  title: string;
  season?: number;
  episode?: number;
}
