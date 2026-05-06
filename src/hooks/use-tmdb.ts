'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTmdbQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Generic hook for TMDB data fetching with caching.
 *
 * @param fetcher - Async function that returns data of type T
 * @param deps - Dependency array to trigger re-fetch
 * @param cacheKey - Optional cache key for in-memory caching
 */
export function useTmdbQuery<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  cacheKey?: string
): UseTmdbQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Simple in-memory cache
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cacheKey && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      const cacheAge = Date.now() - cached.timestamp;
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

      if (cacheAge < CACHE_TTL) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      if (isMounted.current) {
        setData(result);

        // Store in cache
        if (cacheKey) {
          cacheRef.current.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Invalidate cache entry
    if (cacheKey) {
      cacheRef.current.delete(cacheKey);
    }
    fetchData();
  }, [fetchData, cacheKey]);

  return { data, isLoading, error, refetch };
}
