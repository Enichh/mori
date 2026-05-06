// ---------------------------------------------------------------------------
// Mori ― Cache service types
// ---------------------------------------------------------------------------

export interface CacheOptions {
  /** Time-to-live in milliseconds. */
  ttl: number;
  /** Maximum number of entries before LRU eviction kicks in. */
  maxSize?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Generic caching contract.
 * Every cache implementation (memory, localStorage, Redis, …) must satisfy
 * this interface so the TMDB client can depend on the abstraction.
 */
export interface ICache {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  /** Current number of entries. */
  size(): number;
}
