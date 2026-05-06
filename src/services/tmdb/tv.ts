// ---------------------------------------------------------------------------
// Mori ― TV show service (TMDB)
// ---------------------------------------------------------------------------
import type {
  TVShow,
  Credits,
  SimilarResponse,
  VideoResult,
  Season,
  Episode,
} from "@/types/media";
import type { TMDBTVResponse } from "@/types/api";
import type { TmdbClient } from "./client";
import type {
  TMDBTVResult,
  TMDBTVDetail,
  TMDBSeason,
  TMDBEpisode,
  TMDBPaginatedResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapTVResult(r: TMDBTVResult): TVShow {
  return {
    id: r.id,
    mediaType: "tv",
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
  };
}

function mapTVDetail(d: TMDBTVDetail): TVShow {
  return {
    id: d.id,
    mediaType: "tv",
    title: d.name,
    name: d.name,
    originalName: d.original_name,
    overview: d.overview,
    posterPath: d.poster_path,
    backdropPath: d.backdrop_path,
    voteAverage: d.vote_average,
    voteCount: d.vote_count,
    genreIds: d.genres.map((g) => g.id),
    popularity: d.popularity,
    originalLanguage: d.original_language,
    adult: d.adult,
    firstAirDate: d.first_air_date,
    lastAirDate: d.last_air_date,
    numberOfSeasons: d.number_of_seasons,
    numberOfEpisodes: d.number_of_episodes,
    status: d.status,
    seasons: d.seasons.map(mapSeason),
    credits: mapCredits(d.credits),
    similar: mapSimilarTV(d.similar),
    videos: mapVideos(d.videos),
    nextEpisodeToAir: d.next_episode_to_air
      ? mapEpisode(d.next_episode_to_air)
      : null,
  };
}

function mapSeason(s: TMDBSeason): Season {
  return {
    id: s.id,
    name: s.name,
    overview: s.overview,
    seasonNumber: s.season_number,
    episodeCount: s.episode_count,
    posterPath: s.poster_path,
    airDate: s.air_date,
    episodes: s.episodes?.map(mapEpisode),
  };
}

function mapEpisode(e: TMDBEpisode): Episode {
  return {
    id: e.id,
    name: e.name,
    overview: e.overview,
    episodeNumber: e.episode_number,
    seasonNumber: e.season_number,
    stillPath: e.still_path,
    airDate: e.air_date,
    runtime: e.runtime,
    voteAverage: e.vote_average,
    voteCount: e.vote_count,
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

function mapSimilarTV(s: TMDBPaginatedResponse<TMDBTVResult>): SimilarResponse {
  return {
    page: s.page,
    results: s.results.map(mapTVResult),
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

export interface ITVService {
  getTrending(
    timeWindow?: "day" | "week",
    page?: number,
  ): Promise<TMDBTVResponse>;
  getPopular(page?: number): Promise<TMDBTVResponse>;
  getTopRated(page?: number): Promise<TMDBTVResponse>;
  getAiringToday(page?: number): Promise<TMDBTVResponse>;
  getOnTheAir(page?: number): Promise<TMDBTVResponse>;
  getDetails(id: number): Promise<TVShow>;
  getCredits(id: number): Promise<Credits>;
  getSimilar(id: number, page?: number): Promise<SimilarResponse>;
  getSeason(id: number, seasonNumber: number): Promise<Season>;
  getEpisode(
    id: number,
    seasonNumber: number,
    episodeNumber: number,
  ): Promise<Episode>;
  getVideos(id: number): Promise<VideoResult>;
  getKDrama(page?: number): Promise<TMDBTVResponse>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class TVService implements ITVService {
  constructor(private readonly client: TmdbClient) {}

  private get apiKey(): string {
    return this.client.key;
  }

  private async getPaginated(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined> = {},
  ): Promise<TMDBTVResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBTVResult>>(
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
      results: res.data.results.map(mapTVResult),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async getTrending(
    timeWindow: "day" | "week" = "week",
    page = 1,
  ): Promise<TMDBTVResponse> {
    return this.getPaginated(`/trending/tv/${timeWindow}`, { page });
  }

  async getPopular(page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/tv/popular", { page });
  }

  async getTopRated(page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/tv/top_rated", { page });
  }

  async getAiringToday(page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/tv/airing_today", { page });
  }

  async getOnTheAir(page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/tv/on_the_air", { page });
  }

  async getDetails(id: number): Promise<TVShow> {
    const res = await this.client.get<TMDBTVDetail>(`/tv/${id}`, {
      api_key: this.apiKey,
      append_to_response: "credits,similar,videos",
    });
    if (!res.success || !res.data) {
      throw new Error(res.error ?? "Failed to fetch TV details");
    }
    return mapTVDetail(res.data);
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
    }>(`/tv/${id}/credits`, { api_key: this.apiKey });
    if (!res.success || !res.data) {
      return { cast: [], crew: [] };
    }
    return mapCredits(res.data);
  }

  async getSimilar(id: number, page = 1): Promise<SimilarResponse> {
    const res = await this.client.get<TMDBPaginatedResponse<TMDBTVResult>>(
      `/tv/${id}/similar`,
      { api_key: this.apiKey, page },
    );
    if (!res.success || !res.data) {
      return { page: 1, results: [], totalPages: 1, totalResults: 0 };
    }
    return mapSimilarTV(res.data);
  }

  async getSeason(id: number, seasonNumber: number): Promise<Season> {
    const res = await this.client.get<TMDBSeason>(
      `/tv/${id}/season/${seasonNumber}`,
      { api_key: this.apiKey },
    );
    if (!res.success || !res.data) {
      throw new Error(res.error ?? "Failed to fetch season");
    }
    return mapSeason(res.data);
  }

  async getEpisode(
    id: number,
    seasonNumber: number,
    episodeNumber: number,
  ): Promise<Episode> {
    const res = await this.client.get<TMDBEpisode>(
      `/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`,
      { api_key: this.apiKey },
    );
    if (!res.success || !res.data) {
      throw new Error(res.error ?? "Failed to fetch episode");
    }
    return mapEpisode(res.data);
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
    }>(`/tv/${id}/videos`, { api_key: this.apiKey });
    if (!res.success || !res.data) {
      return { results: [] };
    }
    return mapVideos(res.data);
  }

  async getKDrama(page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/discover/tv", {
      with_original_language: "ko",
      with_origin_country: "KR",
      with_genres: "18",
      sort_by: "popularity.desc",
      include_adult: false,
      page,
    });
  }
}
