"use client";

import { useTmdbQuery } from "@/hooks/use-tmdb";
import type {
  BaseMedia,
  Movie,
  TVShow,
  Anime,
  MediaType,
  PaginatedResponse,
} from "@/types";

// --- TMDB API base URL ---
const TMDB_API_BASE = "/api/tmdb";

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const url = `${TMDB_API_BASE}${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// --- useTrending ---

export function useTrending(
  mediaType: MediaType,
  timeWindow: "day" | "week" = "week",
) {
  const tmdbMediaType = mediaType === "anime" ? "tv" : mediaType;
  const endpoint = `/trending/${tmdbMediaType}/${timeWindow}`;

  return useTmdbQuery<PaginatedResponse<BaseMedia>>(
    () => fetchFromApi<PaginatedResponse<BaseMedia>>(endpoint),
    [mediaType, timeWindow],
    `trending:${mediaType}:${timeWindow}`,
  );
}

// --- useMediaDetails ---

export function useMediaDetails(mediaType: MediaType, id: number) {
  const tmdbMediaType = mediaType === "anime" ? "tv" : mediaType;
  const endpoint = `/${tmdbMediaType}/${id}?append_to_response=credits,similar,videos`;

  return useTmdbQuery<Movie | TVShow | Anime>(
    () => fetchFromApi<Movie | TVShow | Anime>(endpoint),
    [mediaType, id],
    `details:${mediaType}:${id}`,
  );
}

// --- useSearch ---

export function useSearch(query: string) {
  const endpoint = query
    ? `/search/multi?query=${encodeURIComponent(query)}&page=1`
    : null;

  return useTmdbQuery<PaginatedResponse<BaseMedia>>(
    () => {
      if (!endpoint)
        return Promise.resolve({
          page: 1,
          totalPages: 0,
          totalResults: 0,
          results: [],
        });
      return fetchFromApi<PaginatedResponse<BaseMedia>>(endpoint);
    },
    [query],
    query ? `search:${query}` : undefined,
  );
}

// --- useSimilar ---

export function useSimilar(mediaType: MediaType, id: number) {
  const tmdbMediaType = mediaType === "anime" ? "tv" : mediaType;
  const endpoint = `/${tmdbMediaType}/${id}/similar`;

  return useTmdbQuery<PaginatedResponse<BaseMedia>>(
    () => fetchFromApi<PaginatedResponse<BaseMedia>>(endpoint),
    [mediaType, id],
    `similar:${mediaType}:${id}`,
  );
}

// --- useDiscover (movies/discover, tv/discover) ---

export function useDiscover(
  mediaType: MediaType,
  params: Record<string, string | number> = {},
) {
  const tmdbMediaType = mediaType === "anime" ? "tv" : mediaType;
  const queryString = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const endpoint = `/discover/${tmdbMediaType}?${queryString}`;

  const cacheKey = `discover:${mediaType}:${queryString}`;

  return useTmdbQuery<PaginatedResponse<BaseMedia>>(
    () => fetchFromApi<PaginatedResponse<BaseMedia>>(endpoint),
    [mediaType, queryString],
    cacheKey,
  );
}

// --- useGenres ---

export function useGenres(mediaType: "movie" | "tv") {
  return useTmdbQuery<{ genres: { id: number; name: string }[] }>(
    () => fetchFromApi(`/genre/${mediaType}/list`),
    [mediaType],
    `genres:${mediaType}`,
  );
}

// --- useSeasonDetails ---

export function useSeasonDetails(tvId: number, seasonNumber: number) {
  const endpoint = `/tv/${tvId}/season/${seasonNumber}`;

  return useTmdbQuery(
    () => fetchFromApi(endpoint),
    [tvId, seasonNumber],
    `season:${tvId}:${seasonNumber}`,
  );
}
