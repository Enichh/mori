"use client";

import { useState, useEffect, useCallback } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Client-side fetch with localStorage caching.
 *
 * - Returns cached data instantly if available and not expired
 * - Refetches in the background if cache is expired (stale-while-revalidate)
 * - Cache TTL is configurable (default: 1 hour for listings, 24h for details)
 */
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 3600000, // 1 hour default
) {
  const [data, setData] = useState<T | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`mori:cache:${key}`);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp < entry.ttl) {
        return entry.data;
      }
    } catch {
      // corrupted cache — ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (force = false) => {
      if (!force && data) return; // already have fresh data

      try {
        setLoading(true);
        setError(null);
        const result = await fetcher();

        setData(result);

        if (typeof window !== "undefined") {
          const entry: CacheEntry<T> = {
            data: result,
            timestamp: Date.now(),
            ttl: ttlMs,
          };
          try {
            localStorage.setItem(`mori:cache:${key}`, JSON.stringify(entry));
          } catch {
            // localStorage full — silently ignore
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    },
    [key, ttlMs, data, fetcher],
  );

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: () => fetchData(true) };
}

/** Clear all mori cached data from localStorage */
export function clearMoriCache() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith("mori:cache:")) {
      localStorage.removeItem(key);
    }
  }
}
