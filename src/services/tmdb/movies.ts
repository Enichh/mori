// ---------------------------------------------------------------------------
// Mori ― Movie service (TMDB)
// ---------------------------------------------------------------------------
import type {
  Movie,
  Credits,
  SimilarResponse,
  VideoResult,
} from "@/types/media";
import type { TMDBMovieResponse } from "@/types/api";
import type { TmdbClient } from "./client";
import type {
  TMDBMovieResult,
  TMDBMovieDetail,
  TMDBPaginatedResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Mapper
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

function mapMovieDetail(d: TMDBMovieDetail): Movie {
  return {
    id: d.id,
    mediaType: "movie",
    title: d.title,
    originalTitle: d.original_title,
    overview: d.overview,
    posterPath: d.poster_path,
    backdropPath: d.backdrop_path,
    voteAverage: d.vote_average,
    voteCount: d.vote_count,
    genreIds: d.genres.map((g) => g.id),
    popularity: d.popularity,
    originalLanguage: d.original_language,
    adult: d.adult,
    releaseDate: d.release_date,
    runtime: d.runtime,
    budget: d.budget,
    revenue: d.revenue,
    status: d.status,
    tagline: d.tagline,
    credits: mapCredits(d.credits),
    similar: mapSimilarMovies(d.similar),
    videos: mapVideos(d.videos),
  };
}

function mapCredits(c: {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}): Credits {
  return {
    cast: c.cast.map((m) => ({
      id: m.id,
      name: m.name,
      character: m.character,
      profilePath: m.profile_path,
      order: m.order,
    })),
    crew: c.crew.map((m) => ({
      id: m.id,
      name: m.name,
      job: m.job,
      department: m.department,
      profilePath: m.profile_path,
    })),
  };
}

function mapSimilarMovies(
  s: TMDBPaginatedResponse<TMDBMovieResult>,
): SimilarResponse {
  return {
    page: s.page,
    results: s.results.map(mapMovieResult),
    totalPages: s.total_pages,
    totalResults: s.total_results,
  };
}

function mapVideos(v: {
  results: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
  }[];
}): VideoResult {
  return { results: v.results };
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IMovieService {
  getTrending(
    timeWindow?: "day" | "week",
    page?: number,
  ): Promise<TMDBMovieResponse>;
  getPopular(page?: number): Promise<TMDBMovieResponse>;
  getTopRated(page?: number): Promise<TMDBMovieResponse>;
  getNowPlaying(page?: number): Promise<TMDBMovieResponse>;
  getUpcoming(page?: number): Promise<TMDBMovieResponse>;
  getDetails(id: number): Promise<Movie>;
  getCredits(id: number): Promise<Credits>;
  getSimilar(id: number, page?: number): Promise<SimilarResponse>;
  getVideos(id: number): Promise<VideoResult>;
  getByGenre(genreId: number, page?: number): Promise<TMDBMovieResponse>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class MovieService implements IMovieService {
  constructor(private readonly client: TmdbClient) {}

  private get apiKey(): string {
    return this.client.key;
  }

  private async getPaginated(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined> = {},
  ): Promise<TMDBMovieResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBMovieResult>>(
      endpoint,
      {
        api_key: this.apiKey,
        ...params,
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

  async getTrending(
    timeWindow: "day" | "week" = "week",
    page = 1,
  ): Promise<TMDBMovieResponse> {
    return this.getPaginated(`/trending/movie/${timeWindow}`, { page });
  }

  async getPopular(page = 1): Promise<TMDBMovieResponse> {
    return this.getPaginated("/movie/popular", { page });
  }

  async getTopRated(page = 1): Promise<TMDBMovieResponse> {
    return this.getPaginated("/movie/top_rated", { page });
  }

  async getNowPlaying(page = 1): Promise<TMDBMovieResponse> {
    return this.getPaginated("/movie/now_playing", { page });
  }

  async getUpcoming(page = 1): Promise<TMDBMovieResponse> {
    return this.getPaginated("/movie/upcoming", { page });
  }

  async getDetails(id: number): Promise<Movie> {
    const res = await this.client.get<TMDBMovieDetail>(`/movie/${id}`, {
      api_key: this.apiKey,
      append_to_response: "credits,similar,videos",
    });
    if (!res.success || !res.data) {
      throw new Error(res.error ?? "Failed to fetch movie details");
    }
    return mapMovieDetail(res.data);
  }

  async getCredits(id: number): Promise<Credits> {
    const res = await this.client.get<{
      cast: {
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
        order: number;
      }[];
      crew: {
        id: number;
        name: string;
        job: string;
        department: string;
        profile_path: string | null;
      }[];
    }>(`/movie/${id}/credits`, { api_key: this.apiKey });
    if (!res.success || !res.data) {
      return { cast: [], crew: [] };
    }
    return mapCredits(res.data);
  }

  async getSimilar(id: number, page = 1): Promise<SimilarResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBMovieResult>>(
      `/movie/${id}/similar`,
      { api_key: this.apiKey, page },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return mapSimilarMovies(res.data);
  }

  async getVideos(id: number): Promise<VideoResult> {
    const res = await this.client.get<{
      results: {
        id: string;
        key: string;
        name: string;
        site: string;
        type: string;
        official: boolean;
      }[];
    }>(`/movie/${id}/videos`, { api_key: this.apiKey });
    if (!res.success || !res.data) {
      return { results: [] };
    }
    return mapVideos(res.data);
  }

  async getByGenre(genreId: number, page = 1): Promise<TMDBMovieResponse> {
    return this.getPaginated("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page,
    });
  }
}
