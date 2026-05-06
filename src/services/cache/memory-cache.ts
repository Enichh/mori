// ---------------------------------------------------------------------------
// Mori ― In-memory cache (Map-based, TTL + LRU eviction)
// ---------------------------------------------------------------------------
import type { ICache, CacheEntry, CacheOptions } from './types';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_SIZE = 500;

/**
 * Lightweight in-memory cache backed by a `Map`.
 *
 * - Entries are evicted lazily on access when their TTL has expired.
 * - When `maxSize` is exceeded the oldest **access** is evicted (simple LRU
 *   implemented via re-insertion on every `get` / `set`).
 */
export class MemoryCache implements ICache {
  private readonly store: Map<string, CacheEntry<unknown>>;
  private readonly defaultTtl: number;
  private readonly maxSize: number;

  constructor(options?: Partial<CacheOptions>) {
    this.store = new Map();
    this.defaultTtl = options?.ttl ?? DEFAULT_TTL_MS;
    this.maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
  }

  // -- public API ----------------------------------------------------------

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // LRU: move the key to the end (most-recently-used)
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.data;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const effectiveTtl = ttl ?? this.defaultTtl;
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + effectiveTtl,
    };

    // LRU refresh – delete first so re-insertion makes it MRU
    this.store.delete(key);

    // Evict oldest if we are about to exceed capacity
    if (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value as string | undefined;
      if (oldest !== undefined) {
        this.store.delete(oldest);
      }
    }

    this.store.set(key, entry);
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  // -- helpers -------------------------------------------------------------

  /** Remove all expired entries – call periodically if desired. */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
