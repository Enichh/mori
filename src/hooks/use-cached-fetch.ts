"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const CACHE_PREFIX = "mori:cache:";

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp < entry.ttl) return entry.data;
  } catch {
    /* corrupt */
  }
  return null;
}

function writeCache<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ data, timestamp: Date.now(), ttl: ttlMs }),
    );
  } catch {
    /* full */
  }
}

/**
 * Client-side fetch with localStorage caching.
 * - Reads cache instantly on mount and on every key change
 * - Fetches from network if cache miss or expired
 * - Refetches on key change
 */
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 3600000,
) {
  const [data, setData] = useState<T | null>(() => readCache<T>(key));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const ttlRef = useRef(ttlMs);
  ttlRef.current = ttlMs;

  useEffect(() => {
    let cancelled = false;

    // Try cache first
    const cached = readCache<T>(key);
    if (cached !== null) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    // Fetch from network
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        writeCache(key, result, ttlRef.current);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key]); // ✅ Re-fetches when key changes

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
      writeCache(key, result, ttlRef.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [key]);

  return { data, loading, error, refetch };
}

export function clearMoriCache() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage);
  for (const k of keys) {
    if (k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
  }
}
