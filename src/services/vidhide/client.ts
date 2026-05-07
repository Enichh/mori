// ---------------------------------------------------------------------------
// Mori ― Vidhide API client
// ---------------------------------------------------------------------------
import type { VidhideSource } from "@/types/player";
import { VIDHIDE_BASE_URL } from "@/lib/constants";
import { slugify } from "@/lib/format";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IVidhideService {
  /** Search for a movie's video sources. */
  searchMovie(title: string, year?: number): Promise<VidhideSource[]>;
  /** Search for a TV episode's video sources. */
  searchTV(
    title: string,
    season?: number,
    episode?: number,
  ): Promise<VidhideSource[]>;
  /** Given a Vidhide source URL, return an embeddable iframe URL. */
  getEmbedUrl(sourceUrl: string): string;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Vidhide video hosting client.
 *
 * This service handles searching Vidhide for hosted video sources and
 * converting them into embeddable iframe URLs.
 *
 * **Note**: The actual Vidhide API may differ; this implementation
 * provides a reasonable client structure that can be adapted when the
 * real API contract is confirmed.
 */
export class VidhideService implements IVidhideService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? VIDHIDE_BASE_URL;
  }

  async searchMovie(title: string, _year?: number): Promise<VidhideSource[]> {
    // The real Vidhide API would be called here.
    // This placeholder returns an empty array; wire up the actual
    // fetch + parse logic when the API contract is confirmed.
    const slug = slugify(title);
    const url = `${this.baseUrl}/api/search?q=${encodeURIComponent(slug)}&type=movie`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return this.parseSources(data);
    } catch {
      return [];
    }
  }

  async searchTV(
    title: string,
    _season?: number,
    _episode?: number,
  ): Promise<VidhideSource[]> {
    const slug = slugify(title);
    const seasonPart = _season ? ` S${String(_season).padStart(2, "0")}` : "";
    const episodePart = _episode ? `E${String(_episode).padStart(2, "0")}` : "";
    const query = `${slug}${seasonPart}${episodePart}`;

    const url = `${this.baseUrl}/api/search?q=${encodeURIComponent(query)}&type=tv`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return this.parseSources(data);
    } catch {
      return [];
    }
  }

  /**
   * Build an embeddable iframe URL from a Vidhide source object.
   *
   * Vidhide typically provides direct file URLs; this wraps them for
   * iframe embedding.
   */
  getEmbedUrl(sourceUrl: string): string {
    // If the URL is already a VidhidePro embed URL, return as-is
    if (sourceUrl.includes("/v/")) return sourceUrl;
    // Convert a file URL to a VidhidePro embed URL
    const fileId = sourceUrl.split("/").pop()?.split(".").shift();
    if (fileId) {
      return `${this.baseUrl}/v/${fileId}`;
    }
    return sourceUrl;
  }

  // -- helpers -------------------------------------------------------------

  private parseSources(data: unknown): VidhideSource[] {
    if (!data || typeof data !== "object") return [];
    const obj = data as Record<string, unknown>;
    const results = Array.isArray(obj.results)
      ? obj.results
      : Array.isArray(obj)
        ? obj
        : [];
    return results.map((item: Record<string, unknown>) => ({
      url: String(item.url ?? item.link ?? ""),
      quality: String(item.quality ?? item.resolution ?? "HD"),
      size: String(item.size ?? item.filesize ?? ""),
      type: String(item.type ?? item.format ?? "mp4"),
    }));
  }
}
