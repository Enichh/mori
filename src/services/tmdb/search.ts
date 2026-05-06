// ---------------------------------------------------------------------------
// Mori ― Search service (TMDB)
// ---------------------------------------------------------------------------
import type {
  TMDBMovieResponse,
  TMDBTVResponse,
  TMDBSearchResponse,
} from "@/types/api";
import type { TmdbClient } from "./client";
import type {
  TMDBMovieResult,
  TMDBTVResult,
  TMDBSearchResult,
  TMDBPaginatedResponse,
} from "./types";
import { ANIME_GENRE_ID, ANIME_KEYWORD_ID } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface ISearchService {
  multiSearch(query: string, page?: number): Promise<TMDBSearchResponse>;
  searchMovies(query: string, page?: number): Promise<TMDBMovieResponse>;
  searchTV(query: string, page?: number): Promise<TMDBTVResponse>;
  searchAnime(query: string, page?: number): Promise<TMDBTVResponse>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SearchService implements ISearchService {
  constructor(private readonly client: TmdbClient) {}

  private get apiKey(): string {
    return this.client.key;
  }

  async multiSearch(query: string, page = 1): Promise<TMDBSearchResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBSearchResult>>(
      "/search/multi",
      {
        api_key: this.apiKey,
        query,
        page,
      },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return {
      page: res.data.page,
      results: res.data.results.map((r) => ({
        id: r.id,
        mediaType: r.media_type,
        title: r.title,
        name: r.name,
        posterPath: r.poster_path,
        profilePath: r.profile_path,
        overview: r.overview,
        releaseDate: r.release_date,
        firstAirDate: r.first_air_date,
        voteAverage: r.vote_average,
      })),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async searchMovies(query: string, page = 1): Promise<TMDBMovieResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBMovieResult>>(
      "/search/movie",
      {
        api_key: this.apiKey,
        query,
        page,
      },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return {
      page: res.data.page,
      results: res.data.results.map((r) => ({
        id: r.id,
        mediaType: "movie" as const,
        title: r.title,
        originalTitle: r.original_title,
        overview: r.overview,
        posterPath: r.poster_path,
        backdropPath: r.backdrop_path,
        voteAverage: r.vote_average,
        voteCount: r.vote_count,
        genreIds: r.genre_ids,
        popularity: r.popularity,
        originalLanguage: r.original_language,
        adult: r.adult,
        releaseDate: r.release_date,
        runtime: null,
        budget: 0,
        revenue: 0,
        status: "",
        tagline: null,
        credits: { cast: [], crew: [] },
        similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
        videos: { results: [] },
      })),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async searchTV(query: string, page = 1): Promise<TMDBTVResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBTVResult>>(
      "/search/tv",
      {
        api_key: this.apiKey,
        query,
        page,
      },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return {
      page: res.data.page,
      results: res.data.results.map((r) => ({
        id: r.id,
        mediaType: "tv" as const,
        title: r.name,
        name: r.name,
        originalName: r.original_name,
        overview: r.overview,
        posterPath: r.poster_path,
        backdropPath: r.backdrop_path,
        voteAverage: r.vote_average,
        voteCount: r.vote_count,
        genreIds: r.genre_ids,
        popularity: r.popularity,
        originalLanguage: r.original_language,
        adult: r.adult,
        firstAirDate: r.first_air_date,
        lastAirDate: "",
        numberOfSeasons: 0,
        numberOfEpisodes: 0,
        status: "",
        seasons: [],
        credits: { cast: [], crew: [] },
        similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
        videos: { results: [] },
        nextEpisodeToAir: null,
      })),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async searchAnime(query: string, page = 1): Promise<TMDBTVResponse> {
    // Use discover/tv with anime filters + text query
    const res = await this.client.get<TMDBPaginatedResponse<TMDBTVResult>>(
      "/discover/tv",
      {
        api_key: this.apiKey,
        with_genres: ANIME_GENRE_ID.toString(),
        with_original_language: "ja",
        with_keywords: ANIME_KEYWORD_ID.toString(),
        sort_by: "popularity.desc",
        query,
        page,
      },
    );
    // Fallback to regular TV search if discover with query returns nothing useful
    if (!res.success || !res.data || res.data.results.length === 0) {
      const fallback = await this.client.get<
        TMDBPaginatedResponse<TMDBTVResult>
      >("/search/tv", {
        api_key: this.apiKey,
        query,
        page,
      });
      if (!fallback.success || !fallback.data) {
        return { page: 1, results: [], totalPages: 1, totalResults: 0 };
      }
      return {
        page: fallback.data.page,
        results: fallback.data.results
          .filter(
            (r) =>
              r.genre_ids?.includes(ANIME_GENRE_ID) ||
              r.original_language === "ja",
          )
          .map((r) => ({
            id: r.id,
            mediaType: "tv" as const,
            title: r.name,
            name: r.name,
            originalName: r.original_name,
            overview: r.overview,
            posterPath: r.poster_path,
            backdropPath: r.backdrop_path,
            voteAverage: r.vote_average,
            voteCount: r.vote_count,
            genreIds: r.genre_ids,
            popularity: r.popularity,
            originalLanguage: r.original_language,
            adult: r.adult,
            firstAirDate: r.first_air_date,
            lastAirDate: "",
            numberOfSeasons: 0,
            numberOfEpisodes: 0,
            status: "",
            seasons: [],
            credits: { cast: [], crew: [] },
            similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
            videos: { results: [] },
            nextEpisodeToAir: null,
          })),
        totalPages: fallback.data.total_pages,
        totalResults: fallback.data.total_results,
      };
    }
    return {
      page: res.data.page,
      results: res.data.results.map((r) => ({
        id: r.id,
        mediaType: "tv" as const,
        title: r.name,
        name: r.name,
        originalName: r.original_name,
        overview: r.overview,
        posterPath: r.poster_path,
        backdropPath: r.backdrop_path,
        voteAverage: r.vote_average,
        voteCount: r.vote_count,
        genreIds: r.genre_ids,
        popularity: r.popularity,
        originalLanguage: r.original_language,
        adult: r.adult,
        firstAirDate: r.first_air_date,
        lastAirDate: "",
        numberOfSeasons: 0,
        numberOfEpisodes: 0,
        status: "",
        seasons: [],
        credits: { cast: [], crew: [] },
        similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
        videos: { results: [] },
        nextEpisodeToAir: null,
      })),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }
}
