// ---------------------------------------------------------------------------
// Mori ― Anime service (TMDB)
// ---------------------------------------------------------------------------
// Anime is backed by the TV endpoints with additional filters:
//   - with_genres=16 (Animation)
//   - with_original_language=ja (Japanese)
//   - with_keywords=210024 (anime keyword)
// ---------------------------------------------------------------------------
import type { Anime, Credits, Season, TVShow } from "@/types/media";
import type { TMDBTVResponse } from "@/types/api";
import type { TmdbClient } from "./client";
import type {
  TMDBTVResult,
  TMDBTVDetail,
  TMDBSeason,
  TMDBPaginatedResponse,
} from "./types";
import { ANIME_GENRE_ID, ANIME_KEYWORD_ID } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Mappers (anime → TVShow for paginated; Anime for detail)
// ---------------------------------------------------------------------------

function mapAnimeResult(r: TMDBTVResult): TVShow {
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

function mapAnimeDetail(d: TMDBTVDetail): Anime {
  return {
    id: d.id,
    mediaType: "anime",
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
    numberOfSeasons: d.number_of_seasons,
    numberOfEpisodes: d.number_of_episodes,
    status: d.status,
    seasons: d.seasons.map(mapSeason),
    credits: mapCredits(d.credits),
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
    episodes: s.episodes?.map((e) => ({
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
    })),
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

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IAnimeService {
  getTrending(page?: number): Promise<TMDBTVResponse>;
  getPopular(page?: number): Promise<TMDBTVResponse>;
  getTopRated(page?: number): Promise<TMDBTVResponse>;
  getDetails(id: number): Promise<Anime>;
  getByGenre(genreIds: number[], page?: number): Promise<TMDBTVResponse>;
  discover(params: {
    sort_by?: string;
    with_genres?: string;
    page?: number;
  }): Promise<TMDBTVResponse>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class AnimeService implements IAnimeService {
  constructor(private readonly client: TmdbClient) {}

  private get apiKey(): string {
    return this.client.key;
  }

  /** Base params used by every discover query to scope results to anime. */
  private get baseParams(): Record<string, string | number | boolean> {
    return {
      with_genres: ANIME_GENRE_ID.toString(),
      with_original_language: "ja",
      with_keywords: ANIME_KEYWORD_ID.toString(),
      sort_by: "popularity.desc",
      include_adult: false,
    };
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
      results: res.data.results.map(mapAnimeResult),
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
    };
  }

  async getTrending(page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/discover/tv", {
      ...this.baseParams,
      page,
    });
  }

  async getPopular(page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/discover/tv", {
      ...this.baseParams,
      page,
    });
  }

  async getTopRated(page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/discover/tv", {
      ...this.baseParams,
      sort_by: "vote_average.desc",
      "vote_count.gte": 50,
      page,
    });
  }

  async getDetails(id: number): Promise<Anime> {
    const res = await this.client.get<TMDBTVDetail>(`/tv/${id}`, {
      api_key: this.apiKey,
      append_to_response: "credits",
    });
    if (!res.success || !res.data) {
      throw new Error(res.error ?? "Failed to fetch anime details");
    }
    return mapAnimeDetail(res.data);
  }

  async getByGenre(genreIds: number[], page = 1): Promise<TMDBTVResponse> {
    return this.getPaginated("/discover/tv", {
      ...this.baseParams,
      with_genres: [ANIME_GENRE_ID, ...genreIds].join(","),
      page,
    });
  }

  async discover(params: {
    sort_by?: string;
    with_genres?: string;
    page?: number;
  }): Promise<TMDBTVResponse> {
    const mergedGenres = params.with_genres
      ? [ANIME_GENRE_ID.toString(), params.with_genres].join(",")
      : ANIME_GENRE_ID.toString();

    return this.getPaginated("/discover/tv", {
      with_genres: mergedGenres,
      with_original_language: "ja",
      with_keywords: ANIME_KEYWORD_ID.toString(),
      sort_by: params.sort_by ?? "popularity.desc",
      include_adult: false,
      page: params.page ?? 1,
    });
  }
}
