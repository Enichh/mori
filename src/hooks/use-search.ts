"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MediaItem, PaginatedResponse } from "@/types";

interface UseSearchOptions {
  debounceMs?: number;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 400 } = options;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string, searchPage: number = 1) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotalPages(1);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          query: searchQuery.trim(),
          page: String(searchPage),
        });

        const response = await fetch(`/api/tmdb/search/multi?${params}`);
        if (!response.ok) throw new Error("Search failed");

        const data: PaginatedResponse<MediaItem> = await response.json();
        setResults(data.results);
        setTotalPages(data.totalPages);
        setPage(searchPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query, 1);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs, performSearch]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !isLoading) {
      performSearch(query, page + 1);
    }
  }, [page, totalPages, isLoading, query, performSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    page,
    totalPages,
    loadMore,
  };
}
