// ---------------------------------------------------------------------------
// Mori ― Global media type definitions
// ---------------------------------------------------------------------------

export interface BaseMedia {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  popularity: number;
  originalLanguage: string;
  adult: boolean;
}

export interface Movie extends BaseMedia {
  mediaType: "movie";
  title: string;
  originalTitle: string;
  releaseDate: string;
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  tagline: string | null;
  imdbId?: string | null;
  genres?: Genre[];
  credits: Credits;
  similar: SimilarResponse;
  videos: VideoResult;
}

export interface TVShow extends BaseMedia {
  mediaType: "tv";
  name: string;
  originalName: string;
  firstAirDate: string;
  lastAirDate: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  status: string;
  tagline?: string | null;
  genres?: Genre[];
  seasons: Season[];
  credits: Credits;
  similar: SimilarResponse;
  videos: VideoResult;
  nextEpisodeToAir: Episode | null;
  imdbId?: string | null;
}

export interface Anime extends BaseMedia {
  mediaType: "anime";
  title: string;
  name: string;
  originalName: string;
  firstAirDate: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  status: string;
  tagline?: string | null;
  genres?: Genre[];
  seasons: Season[];
  credits: Credits;
  similar?: SimilarResponse;
  videos?: VideoResult;
}

// ---- Sub-entities --------------------------------------------------------

export interface Season {
  id: number;
  name: string;
  overview: string;
  seasonNumber: number;
  episodeCount: number;
  posterPath: string | null;
  airDate: string | null;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episodeNumber: number;
  seasonNumber: number;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
  voteAverage: number;
  voteCount: number;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface VideoResult {
  results: Video[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface SimilarResponse {
  page: number;
  results: BaseMedia[];
  totalPages: number;
  totalResults: number;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  totalPages: number;
  totalResults: number;
}

// ---- Union / lookup types ------------------------------------------------

export type MediaType = "movie" | "tv" | "anime";
export type MediaItem = Movie | TVShow | Anime;

export type SortOption =
  | "popularity.desc"
  | "vote_average.desc"
  | "release_date.desc"
  | "first_air_date.desc"
  | "original_title.asc"
  | "revenue.desc";

export interface SortItem {
  value: SortOption;
  label: string;
}

export interface SearchResult {
  id: number;
  mediaType: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  posterPath: string | null;
  profilePath?: string | null;
  overview?: string;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage?: number;
}

// ---- AniList Types --------------------------------------------------------

export interface AnilistAnime {
  id: number;
  title: string;
  nativeTitle: string;
  description: string;
  coverImage: string;
  bannerImage: string | null;
  format: string;
  status: string;
  episodes: number | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number;
  genres: string[];
  studios: string[];
}

export interface AnilistCharacter {
  id: number;
  name: string;
  image: string;
  role: string;
  voiceActors: {
    id: number;
    name: string;
    image: string;
    language: string;
  }[];
}

export interface AnilistAnimeDetail extends AnilistAnime {
  characters: AnilistCharacter[];
  recommendations: (AnilistAnime & { rating: number })[];
  streamingEpisodes: {
    title: string;
    thumbnail: string;
    url: string;
    site: string;
  }[];
}

export interface AnilistPaginatedResult {
  page: number;
  results: AnilistAnime[];
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
}

// ---- Consumet Types -------------------------------------------------------

export interface ConsumetAnimeInfo {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate: string | null;
  description: string | null;
  genres: string[];
  subOrDub: "sub" | "dub";
  type: string | null;
  status: string;
  otherName: string | null;
  totalEpisodes: number;
  episodes: ConsumetEpisode[];
}

export interface ConsumetEpisode {
  id: string;
  number: number;
  title?: string;
  url: string;
  isFiller?: boolean;
}

export interface ConsumetSource {
  url: string;
  isM3U8: boolean;
  quality: string;
}

export interface ConsumetStreamingData {
  headers?: Record<string, string>;
  sources: ConsumetSource[];
  subtitles?: { url: string; lang: string }[];
}
