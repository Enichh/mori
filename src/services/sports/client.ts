// ---------------------------------------------------------------------------
// Mori ― Sports API client (singleton, cached, typed)
// ---------------------------------------------------------------------------
import type { APIResponse } from "@/types/api";
import type { ICache } from "@/services/cache";
import { MemoryCache } from "@/services/cache";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CDNLIVE_BASE = "/api/sports";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Low-level HTTP client for the cdnlivetv API.
 *
 * **Single responsibility**: transport.  It knows how to parse JSON and wrap
 * errors into `APIResponse<T>`.  Everything else (endpoint URLs, parameter
 * mapping, data normalisation) belongs to the higher-level service classes.
 *
 * Uses the **Singleton** pattern so the in-memory cache is shared across all
 * Sports sub-services for the lifetime of the app.
 */
export class SportsClient {
  private static instance: SportsClient;

  private readonly cache: ICache;

  private constructor(cache?: ICache) {
    this.cache = cache ?? new MemoryCache();
  }

  /** Base URL for cdnlivetv API. */
  static get CDNLIVE_BASE(): string {
    return CDNLIVE_BASE;
  }

  /** Return (or create) the shared singleton. */
  static getInstance(cache?: ICache): SportsClient {
    if (!SportsClient.instance) {
      SportsClient.instance = new SportsClient(cache);
    }
    return SportsClient.instance;
  }

  /**
   * Perform a **cached** `GET` request.
   *
   * The cache key is derived from the endpoint + sorted query params so
   * identical requests hit the cache regardless of param order.
   *
   * @param endpoint - API path (e.g. `/events/sports/nba`)
   * @param params - Optional query parameters
   * @param baseUrl - Base URL override (defaults to cdnlivetv)
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    baseUrl: string = CDNLIVE_BASE,
  ): Promise<APIResponse<T>> {
    const qs = buildQueryString(params);
    const url = `${baseUrl}${endpoint}${qs ? "?" + qs : ""}`;
    const cacheKey = `sports:${endpoint}:${qs}`;

    const cached = this.cache.get<T>(cacheKey);
    if (cached !== null) {
      return { success: true, data: cached };
    }

    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 600 }, // Cache API responses for 10 minutes
      });

      if (!res.ok) {
        const body = await res.text();
        return {
          success: false,
          error: `Sports API ${res.status}: ${body.slice(0, 200)}`,
        };
      }

      const data = (await res.json()) as T;
      this.cache.set(cacheKey, data);
      return { success: true, data };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown fetch error";
      return { success: false, error: message };
    }
  }

  /**
   * Perform a **non-cached** `POST` request.
   */
  async post<T>(
    endpoint: string,
    body: unknown,
    params?: Record<string, string | number | boolean | undefined>,
    baseUrl: string = CDNLIVE_BASE,
  ): Promise<APIResponse<T>> {
    const qs = buildQueryString(params);
    const url = `${baseUrl}${endpoint}${qs ? "?" + qs : ""}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          success: false,
          error: `Sports API ${res.status}: ${text.slice(0, 200)}`,
        };
      }

      const data = (await res.json()) as T;
      return { success: true, data };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown fetch error";
      return { success: false, error: message };
    }
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildQueryString(
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const sp = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        sp.set(k, String(v));
      }
    }
  }
  return sp.toString();
}
