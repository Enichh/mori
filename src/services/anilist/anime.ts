// ---------------------------------------------------------------------------
// Mori ― AniList Anime service
// ---------------------------------------------------------------------------
import type {
  AnilistAnime,
  AnilistAnimeDetail,
  AnilistPaginatedResult,
} from "@/types/media";
import { AnilistClient } from "./client";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IAnilistAnimeService {
  getTrending(page?: number): Promise<AnilistPaginatedResult>;
  getPopular(page?: number): Promise<AnilistPaginatedResult>;
  getTopRated(page?: number): Promise<AnilistPaginatedResult>;
  getThisSeason(page?: number): Promise<AnilistPaginatedResult>;
  getDetails(id: number): Promise<AnilistAnimeDetail>;
  search(query: string, page?: number): Promise<AnilistPaginatedResult>;
  discover(params: {
    sort?:
      | "TRENDING_DESC"
      | "POPULARITY_DESC"
      | "SCORE_DESC"
      | "START_DATE_DESC";
    genre?: string;
    season?: string;
    seasonYear?: number;
    page?: number;
  }): Promise<AnilistPaginatedResult>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class AnilistAnimeService implements IAnilistAnimeService {
  constructor(private readonly client: AnilistClient) {}

  private mapAnimeResult(a: any): AnilistAnime {
    return {
      id: a.id,
      title: a.title?.english ?? a.title?.romaji ?? a.title?.native ?? "",
      nativeTitle: a.title?.native ?? "",
      description: a.description ?? "",
      coverImage: a.coverImage?.large ?? a.coverImage?.medium ?? "",
      bannerImage: a.bannerImage ?? null,
      format: a.format ?? "TV",
      status: a.status ?? "NOT_YET_RELEASED",
      episodes: a.episodes ?? null,
      season: a.season ?? null,
      seasonYear: a.seasonYear ?? null,
      averageScore: a.averageScore ?? null,
      popularity: a.popularity ?? 0,
      genres: a.genres ?? [],
      studios: a.studios?.nodes?.map((s: any) => s.name) ?? [],
    };
  }

  private mapAnimeDetail(a: any): AnilistAnimeDetail {
    return {
      ...this.mapAnimeResult(a),
      characters:
        a.characters?.edges?.slice(0, 20).map((e: any) => ({
          id: e.node.id,
          name: e.node.name?.userPreferred ?? e.node.name?.full ?? "",
          image: e.node.image?.large ?? e.node.image?.medium ?? "",
          role: e.role ?? "SUPPORTING",
          voiceActors:
            e.voiceActors?.slice(0, 2).map((va: any) => ({
              id: va.id,
              name: va.name?.userPreferred ?? va.name?.full ?? "",
              image: va.image?.large ?? va.image?.medium ?? "",
              language: va.language ?? "Japanese",
            })) ?? [],
        })) ?? [],
      recommendations:
        a.recommendations?.edges?.slice(0, 12).map((e: any) => ({
          ...this.mapAnimeResult(e.node.mediaRecommendation),
          rating: e.node.rating ?? 0,
        })) ?? [],
      streamingEpisodes: a.streamingEpisodes ?? [],
    };
  }

  async getTrending(page = 1): Promise<AnilistPaginatedResult> {
    return this.fetchPage("TRENDING_DESC", undefined, page);
  }

  async getPopular(page = 1): Promise<AnilistPaginatedResult> {
    return this.fetchPage("POPULARITY_DESC", undefined, page);
  }

  async getTopRated(page = 1): Promise<AnilistPaginatedResult> {
    return this.fetchPage("SCORE_DESC", undefined, page);
  }

  async getThisSeason(page = 1): Promise<AnilistPaginatedResult> {
    const now = new Date();
    const month = now.getMonth();
    let season: string;
    if (month >= 0 && month <= 2) season = "WINTER";
    else if (month >= 3 && month <= 5) season = "SPRING";
    else if (month >= 6 && month <= 8) season = "SUMMER";
    else season = "FALL";
    return this.fetchPage(
      "POPULARITY_DESC",
      { season, seasonYear: now.getFullYear() },
      page,
    );
  }

  async getDetails(id: number): Promise<AnilistAnimeDetail> {
    const query = `query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english native }
        description(asHtml: false)
        coverImage { large medium }
        bannerImage
        format
        status
        episodes
        season
        seasonYear
        averageScore
        popularity
        genres
        studios { nodes { name } }
        streamingEpisodes { title thumbnail url site }
        characters(sort: ROLE, perPage: 20) {
          edges {
            role
            node {
              id
              name { full native userPreferred }
              image { large medium }
            }
            voiceActors(language: JAPANESE) {
              id
              name { full native userPreferred }
              image { large medium }
              language: languageV2
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 12) {
          edges {
            node {
              rating
              mediaRecommendation {
                id
                title { english romaji native }
                coverImage { large }
                format
                status
                episodes
                averageScore
                popularity
                genres
              }
            }
          }
        }
      }
    }`;
    const data = await this.client.query<{ Media: any }>(query, { id });
    return this.mapAnimeDetail(data.Media);
  }

  async search(query: string, page = 1): Promise<AnilistPaginatedResult> {
    const gql = `query ($q: String, $page: Int) {
      Page(page: $page, perPage: 18) {
        pageInfo { total perPage currentPage lastPage hasNextPage }
        media(search: $q, type: ANIME, sort: SEARCH_MATCH) {
          id
          title { romaji english native }
          coverImage { large }
          format
          status
          episodes
          averageScore
          popularity
          genres
          season
          seasonYear
        }
      }
    }`;
    const data = await this.client.query<{ Page: any }>(gql, {
      q: query,
      page,
    });
    return {
      page: data.Page.pageInfo.currentPage,
      results: data.Page.media.map((m: any) => this.mapAnimeResult(m)),
      totalPages: data.Page.pageInfo.lastPage,
      totalResults: data.Page.pageInfo.total,
      hasNextPage: data.Page.pageInfo.hasNextPage,
    };
  }

  async discover(params: {
    sort?:
      | "TRENDING_DESC"
      | "POPULARITY_DESC"
      | "SCORE_DESC"
      | "START_DATE_DESC";
    genre?: string;
    season?: string;
    seasonYear?: number;
    page?: number;
  }): Promise<AnilistPaginatedResult> {
    const extra: Record<string, unknown> = {};
    if (params.genre) extra.genre = params.genre;
    if (params.season) extra.season = params.season;
    if (params.seasonYear) extra.seasonYear = params.seasonYear;
    return this.fetchPage(
      params.sort ?? "POPULARITY_DESC",
      Object.keys(extra).length > 0 ? extra : undefined,
      params.page ?? 1,
    );
  }

  private async fetchPage(
    sort: string,
    extra?: Record<string, unknown>,
    page = 1,
  ): Promise<AnilistPaginatedResult> {
    const vars: Record<string, unknown> = { page, sort };
    if (extra) Object.assign(vars, extra);

    const varDecls = ["$page: Int", "$sort: [MediaSort]"];
    let mediaArgs = "type: ANIME, sort: $sort";

    if (extra?.genre) {
      varDecls.push("$genre: String");
      mediaArgs += ", genre: $genre";
    }
    if (extra?.season) {
      varDecls.push("$season: MediaSeason");
      mediaArgs += ", season: $season";
    }
    if (extra?.seasonYear) {
      varDecls.push("$seasonYear: Int");
      mediaArgs += ", seasonYear: $seasonYear";
    }

    const query = `query (${varDecls.join(", ")}) {
      Page(page: $page, perPage: 18) {
        pageInfo { total perPage currentPage lastPage hasNextPage }
        media(${mediaArgs}) {
          id
          title { romaji english native }
          coverImage { large }
          format
          status
          episodes
          averageScore
          popularity
          genres
          season
          seasonYear
        }
      }
    }`;
    const data = await this.client.query<{ Page: any }>(query, vars);
    return {
      page: data.Page.pageInfo.currentPage,
      results: data.Page.media.map((m: any) => this.mapAnimeResult(m)),
      totalPages: data.Page.pageInfo.lastPage,
      totalResults: data.Page.pageInfo.total,
      hasNextPage: data.Page.pageInfo.hasNextPage,
    };
  }
}
