// ---------------------------------------------------------------------------
// Mori ― Genre service (TMDB)
// ---------------------------------------------------------------------------
import type { Genre } from "@/types/media";
import type { TmdbClient } from "./client";
import type { TMDBGenreListResponse } from "./types";
import { ANIME_GENRE_ID } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IGenreService {
  getMovieGenres(): Promise<Genre[]>;
  getTVGenres(): Promise<Genre[]>;
  getAnimeGenres(): Promise<Genre[]>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class GenreService implements IGenreService {
  constructor(private readonly client: TmdbClient) {}

  private get apiKey(): string {
    return this.client.key;
  }

  async getMovieGenres(): Promise<Genre[]> {
    const res = await this.client.get<TMDBGenreListResponse>(
      "/genre/movie/list",
      {
        api_key: this.apiKey,
      },
    );
    if (!res.success || !res.data) return [];
    return res.data.genres;
  }

  async getTVGenres(): Promise<Genre[]> {
    const res = await this.client.get<TMDBGenreListResponse>("/genre/tv/list", {
      api_key: this.apiKey,
    });
    if (!res.success || !res.data) return [];
    return res.data.genres;
  }

  /**
   * Returns only genres that are likely animation-related.
   * The primary filter is the Animation genre (ID 16); additional
   * companion genres like Sci-Fi & Fantasy, Action & Adventure, etc.
   * are also included because they commonly co-occur with anime.
   */
  async getAnimeGenres(): Promise<Genre[]> {
    const all = await this.getTVGenres();
    // Animation-related genre IDs commonly paired with anime on TMDB
    const animeRelatedIds = new Set([
      ANIME_GENRE_ID, // 16 - Animation
      10759, // Action & Adventure
      10765, // Sci-Fi & Fantasy
      18, // Drama
      35, // Comedy
      10762, // Kids (some anime)
      80, // Crime
      9648, // Mystery
    ]);
    return all.filter((g) => animeRelatedIds.has(g.id));
  }
}
