// ---------------------------------------------------------------------------
// Mori ― Regional / country-specific service (TMDB)
// ---------------------------------------------------------------------------
import type { Movie, TVShow } from "@/types/media";
import type { TMDBMovieResponse, TMDBTVResponse } from "@/types/api";
import type { TmdbClient } from "./client";
import type {
  TMDBMovieResult,
  TMDBTVResult,
  TMDBPaginatedResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapMovieResult(r: TMDBMovieResult): Movie {
  return {
    id: r.id,
    mediaType: "movie",
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
  };
}

function mapTVResult(r: TMDBTVResult): TVShow {
  return {
    id: r.id,
    mediaType: "tv",
    name: r.name,
    originalName: r.original_name,
    title: r.name,
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
  };
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IRegionalService {
  getFilipinoMovies(page?: number): Promise<TMDBMovieResponse>;
  getFilipinoTV(page?: number): Promise<TMDBTVResponse>;
  getByCountry(country: string, page?: number): Promise<TMDBMovieResponse>;
  discoverFilipinoMovies(params: {
    sort_by?: string;
    with_genres?: number;
    page?: number;
  }): Promise<TMDBMovieResponse>;
  discoverFilipinoTV(params: {
    sort_by?: string;
    with_genres?: number;
    page?: number;
  }): Promise<TMDBTVResponse>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class RegionalService implements IRegionalService {
  constructor(private readonly client: TmdbClient) {}

  private get apiKey(): string {
    return this.client.key;
  }

  async getFilipinoMovies(page = 1): Promise<TMDBMovieResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBMovieResult>>(
      "/discover/movie",
      {
        api_key: this.apiKey,
        with_original_language: "tl",
        with_origin_country: "PH",
        sort_by: "popularity.desc",
        include_adult: false,
        page,
      },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return {
      page: res.data.page,
      results: res.data.results.map(mapMovieResult),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async getFilipinoTV(page = 1): Promise<TMDBTVResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBTVResult>>(
      "/discover/tv",
      {
        api_key: this.apiKey,
        with_original_language: "tl",
        with_origin_country: "PH",
        sort_by: "popularity.desc",
        include_adult: false,
        page,
      },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return {
      page: res.data.page,
      results: res.data.results.map(mapTVResult),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async discoverFilipinoMovies(params: {
    sort_by?: string;
    with_genres?: number;
    page?: number;
  }): Promise<TMDBMovieResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBMovieResult>>(
      "/discover/movie",
      {
        api_key: this.apiKey,
        with_original_language: "tl",
        with_origin_country: "PH",
        sort_by: params.sort_by ?? "popularity.desc",
        with_genres: params.with_genres?.toString(),
        include_adult: false,
        page: params.page ?? 1,
      },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return {
      page: res.data.page,
      results: res.data.results.map(mapMovieResult),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async discoverFilipinoTV(params: {
    sort_by?: string;
    with_genres?: number;
    page?: number;
  }): Promise<TMDBTVResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBTVResult>>(
      "/discover/tv",
      {
        api_key: this.apiKey,
        with_original_language: "tl",
        with_origin_country: "PH",
        sort_by: params.sort_by ?? "popularity.desc",
        with_genres: params.with_genres?.toString(),
        include_adult: false,
        page: params.page ?? 1,
      },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return {
      page: res.data.page,
      results: res.data.results.map(mapTVResult),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async getByCountry(country: string, page = 1): Promise<TMDBMovieResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBMovieResult>>(
      "/discover/movie",
      {
        api_key: this.apiKey,
        with_origin_country: country,
        sort_by: "popularity.desc",
        include_adult: false,
        page,
      },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return {
      page: res.data.page,
      results: res.data.results.map(mapMovieResult),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }
}
