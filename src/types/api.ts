// ---------------------------------------------------------------------------
// Mori ― API-level type aliases
// ---------------------------------------------------------------------------
import type { Movie, TVShow, PaginatedResponse, SearchResult, Genre } from './media';

export type TMDBMovieResponse = PaginatedResponse<Movie>;
export type TMDBTVResponse = PaginatedResponse<TVShow>;
export type TMDBSearchResponse = PaginatedResponse<SearchResult>;

/** Generic envelope for every service-layer response. */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GenreListResponse {
  genres: Genre[];
}
