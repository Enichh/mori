// ---------------------------------------------------------------------------
// Mori ― TMDB raw API response shapes (internal)
// ---------------------------------------------------------------------------
// These DTOs mirror the actual JSON returned by api.themoviedb.org.
// They are *not* exported from the service facade – only the normalised
// domain types from `@/types/*` ever leave this layer.
// ---------------------------------------------------------------------------

// ---- Generic paginated response envelope ---------------------------------

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// ---- Movie ---------------------------------------------------------------

export interface TMDBMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  adult: boolean;
  release_date: string;
  video: boolean;
  media_type?: string;
}

export interface TMDBMovieDetail {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genres: TMDBGenre[];
  popularity: number;
  original_language: string;
  adult: boolean;
  release_date: string;
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  tagline: string | null;
  credits: TMDBCredits;
  similar: TMDBPaginatedResponse<TMDBMovieResult>;
  videos: TMDBVideosResponse;
}

// ---- TV ------------------------------------------------------------------

export interface TMDBTVResult {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  adult: boolean;
  first_air_date: string;
  media_type?: string;
  origin_country?: string[];
}

export interface TMDBTVDetail {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genres: TMDBGenre[];
  popularity: number;
  original_language: string;
  adult: boolean;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  seasons: TMDBSeason[];
  credits: TMDBCredits;
  similar: TMDBPaginatedResponse<TMDBTVResult>;
  videos: TMDBVideosResponse;
  next_episode_to_air: TMDBEpisode | null;
  origin_country?: string[];
}

// ---- Season / Episode ----------------------------------------------------

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
}

// ---- Credits -------------------------------------------------------------

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

// ---- Genre ---------------------------------------------------------------

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreListResponse {
  genres: TMDBGenre[];
}

// ---- Videos --------------------------------------------------------------

export interface TMDBVideosResponse {
  results: TMDBVideo[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

// ---- Search --------------------------------------------------------------

export interface TMDBSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  poster_path: string | null;
  profile_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}
