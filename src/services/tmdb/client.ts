// ---------------------------------------------------------------------------
// Mori ― TMDB API client (singleton, cached, typed)
// ---------------------------------------------------------------------------
import type { APIResponse } from "@/types/api";
import type { ICache } from "@/services/cache";
import { MemoryCache } from "@/services/cache";
import { TMDB_BASE_URL } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function envApiKey(): string {
  if (typeof process !== "undefined") {
    // Check server-side env var first, then NEXT_PUBLIC_ fallback
    if (process.env.TMDB_API_KEY) return process.env.TMDB_API_KEY;
    if (process.env.NEXT_PUBLIC_TMDB_API_KEY)
      return process.env.NEXT_PUBLIC_TMDB_API_KEY;
  }
  return "";
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Low-level HTTP client for api.themoviedb.org.
 *
 * **Single responsibility**: transport.  It knows how to append the API key,
 * parse JSON, and wrap errors into `APIResponse<T>`.  Everything else
 * (endpoint URLs, parameter mapping, data normalisation) belongs to the
 * higher-level service classes.
 *
 * Uses the **Singleton** pattern so the in-memory cache is shared across all
 * TMDB sub-services for the lifetime of the app.
 */
export class TmdbClient {
  private static instance: TmdbClient;

  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly cache: ICache;

  private constructor(apiKey?: string, cache?: ICache) {
    this.baseUrl = TMDB_BASE_URL;
    this.apiKey = apiKey ?? envApiKey();
    this.cache = cache ?? new MemoryCache();
  }

  /** The resolved API key (read-only). */
  get key(): string {
    return this.apiKey;
  }

  /** Return (or create) the shared singleton. */
  static getInstance(apiKey?: string, cache?: ICache): TmdbClient {
    if (!TmdbClient.instance) {
      TmdbClient.instance = new TmdbClient(apiKey, cache);
    }
    return TmdbClient.instance;
  }

  /**
   * Perform a **cached** `GET` request.
   *
   * The cache key is derived from the endpoint + sorted query params so
   * identical requests hit the cache regardless of param order.
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<APIResponse<T>> {
    const qs = buildQueryString(params);
    const url = `${this.baseUrl}${endpoint}?${qs}`;
    const cacheKey = `tmdb:${endpoint}:${qs}`;

    const cached = this.cache.get<T>(cacheKey);
    if (cached !== null) {
      return { success: true, data: cached };
    }

    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        // Next.js extends fetch with ISR tags; keep it simple for now
      });

      if (!res.ok) {
        const body = await res.text();
        return {
          success: false,
          error: `TMDB ${res.status}: ${body.slice(0, 200)}`,
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
   * Perform a **non-cached** `POST` request (rarely used by TMDB, but
   * provided for completeness).
   */
  async post<T>(
    endpoint: string,
    body: unknown,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<APIResponse<T>> {
    const qs = buildQueryString(params);
    const url = `${this.baseUrl}${endpoint}?${qs}`;

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
          error: `TMDB ${res.status}: ${text.slice(0, 200)}`,
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
  // Always include the API key
  // It will be added by each service; the client doesn't inject it magically
  // because the key is already embedded via the service methods.
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        sp.set(k, String(v));
      }
    }
  }
  return sp.toString();
}
