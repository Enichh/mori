// ---------------------------------------------------------------------------
// Mori ― Anime streaming service (1Anime CDN)
// ---------------------------------------------------------------------------
import type { ConsumetStreamingData } from "@/types/media";
import { ANIME_STREAM_BASE_URL } from "@/lib/constants";

const UA =
  "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";

// ---- Response shapes from 1Anime CDN --------------------------------------

interface OneAnimeStreamResponse {
  success: boolean;
  data?: {
    episode?: { id: number; anilist_id: number; audio: string };
    video?: { file_code: string; file_id: string; original_filename: string };
    links?: {
      stream?: string;
      thumbnail?: string;
      thumbnails_vtt?: string;
    };
    subtitles?: Array<{
      language: string;
      language_name: string;
      title: string;
      format: string;
      is_default: boolean;
      url: string;
    }>;
  };
}

// ---- Public interface -----------------------------------------------------

export interface IConsumetService {
  search(query: string): Promise<any[]>;
  getInfo(anilistId: number): Promise<any | null>;
  getSources(
    episodeId: string,
    server?: string,
  ): Promise<ConsumetStreamingData | null>;
  getStream(
    anilistId: number,
    episode: number,
  ): Promise<ConsumetStreamingData | null>;
  getEmbedUrl(sourceUrl: string): string;
}

export class ConsumetService implements IConsumetService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? ANIME_STREAM_BASE_URL;
  }

  // ------------------------------------------------------------------
  // Legacy stubs (kept for interface compatibility)
  // ------------------------------------------------------------------

  async search(_query: string): Promise<any[]> {
    return [];
  }

  async getInfo(_anilistId: number): Promise<any | null> {
    // The 1Anime CDN doesn't have a separate "info" endpoint.
    // Episodes are fetched directly via getStream below.
    return null;
  }

  async getSources(
    _episodeId: string,
    _server?: string,
  ): Promise<ConsumetStreamingData | null> {
    // Replaced by getStream below which uses anilistId + episode number.
    return null;
  }

  // ------------------------------------------------------------------
  // 1Anime CDN ― direct episode stream
  // ------------------------------------------------------------------

  async getStream(
    anilistId: number,
    episode: number,
  ): Promise<ConsumetStreamingData | null> {
    try {
      const url = `${this.baseUrl}/cdn/zen/${anilistId}/${episode}?audio=sub`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json, text/plain, */*",
          "User-Agent": UA,
        },
      });
      if (!res.ok) return null;

      const json: OneAnimeStreamResponse = await res.json();
      if (!json.success || !json.data?.links?.stream) return null;

      const stream = json.data.links.stream;
      const subtitles = (json.data.subtitles ?? []).map((s) => ({
        url: s.url,
        lang: s.language,
      }));

      return {
        sources: [{ url: stream, isM3U8: true, quality: "auto" }],
        subtitles,
      };
    } catch {
      return null;
    }
  }

  // ------------------------------------------------------------------
  // Utility
  // ------------------------------------------------------------------

  getEmbedUrl(sourceUrl: string): string {
    return sourceUrl;
  }
}
