"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { SelectSort } from "@/components/ui/select-sort";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import type { TVShow, Genre } from "@/types";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";

const SORT_OPTIONS = [
  { value: "popularity.desc" as const, label: "Most Popular" },
  { value: "vote_average.desc" as const, label: "Highest Rated" },
  { value: "first_air_date.desc" as const, label: "Newest" },
];

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapTVShow(r: any): TVShow {
  return {
    id: r.id,
    mediaType: "tv" as const,
    title: r.name,
    name: r.name,
    originalName: r.original_name,
    overview: r.overview,
    posterPath: r.poster_path,
    backdropPath: r.backdrop_path,
    voteAverage: r.vote_average,
    voteCount: r.vote_count,
    genreIds: r.genre_ids || [],
    popularity: r.popularity,
    originalLanguage: r.original_language,
    adult: r.adult,
    firstAirDate: r.first_air_date,
    lastAirDate: r.last_air_date,
    numberOfSeasons: r.number_of_seasons || 0,
    numberOfEpisodes: r.number_of_episodes || 0,
    status: r.status || "",
    seasons: [],
    credits: { cast: [], crew: [] },
    similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
    videos: { results: [] },
    nextEpisodeToAir: null,
  } as TVShow;
}

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

interface TVData {
  shows: TVShow[];
  totalPages: number;
  totalResults: number;
}

// ---------------------------------------------------------------------------
// Fetchers (run in browser)
// ---------------------------------------------------------------------------

async function fetchKDrama(
  page: number,
  genre?: string,
  sort?: string,
): Promise<TVData> {
  const params = new URLSearchParams();
  params.set("api_key", TMDB_KEY);
  params.set("sort_by", sort || "popularity.desc");
  params.set("page", String(page));
  params.set("with_original_language", "ko");
  params.set("with_origin_country", "KR");
  if (genre) params.set("with_genres", genre);

  const res = await fetch(`${TMDB_BASE}/discover/tv?${params.toString()}`);
  if (!res.ok) return { shows: [], totalPages: 0, totalResults: 0 };
  const data = await res.json();
  return {
    shows: (data.results || []).map(mapTVShow),
    totalPages: Math.min(data.total_pages || 0, 500),
    totalResults: data.total_results || 0,
  };
}

async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch(`${TMDB_BASE}/genre/tv/list?api_key=${TMDB_KEY}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres || [];
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function KDramaSkeleton() {
  return (
    <div className="container-cine py-8">
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-40 bg-muted rounded mb-2" />
        <div className="h-4 w-72 bg-muted rounded" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-muted rounded" />
        ))}
      </div>

      <div className="py-4 border-b border-border animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 py-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] bg-muted rounded-lg" />
            <div className="h-3 w-3/4 bg-muted rounded mt-2 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner component (uses useSearchParams, must be inside Suspense)
// ---------------------------------------------------------------------------

function KDramaClientInner() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const genreParam = searchParams.get("genre") || undefined;
  const sortParam = searchParams.get("sort") || "popularity.desc";

  const currentPage = parseInt(pageParam, 10) || 1;

  const cacheKey = `kdrama:${currentPage}:${genreParam || "all"}:${sortParam}`;

  const {
    data: kdramaData,
    loading: kdramaLoading,
    error: kdramaError,
    refetch: refetchKDrama,
  } = useCachedFetch<TVData>(
    cacheKey,
    () => fetchKDrama(currentPage, genreParam, sortParam),
    3600000,
  );

  const {
    data: genres,
    loading: genresLoading,
    error: genresError,
  } = useCachedFetch<Genre[]>("kdrama:genres", fetchGenres, 86400000);

  const isLoading = kdramaLoading || genresLoading;
  const hasError = kdramaError || genresError;

  // ---- Loading state ----
  if (isLoading && !kdramaData) {
    return <KDramaSkeleton />;
  }

  // ---- Error state ----
  if (hasError && !kdramaData) {
    return (
      <div className="container-cine py-20 text-center">
        <div className="terminal-box max-w-md mx-auto">
          <p className="text-destructive text-sm mb-3">
            Failed to load KDramas.
          </p>
          {kdramaError && (
            <p className="text-muted-foreground text-xs font-mono break-all mb-4">
              {kdramaError}
            </p>
          )}
          {genresError && (
            <p className="text-muted-foreground text-xs font-mono break-all mb-4">
              {genresError}
            </p>
          )}
          <button
            onClick={() => refetchKDrama()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const shows = kdramaData?.shows || [];
  const totalPages = kdramaData?.totalPages || 0;
  const totalResults = kdramaData?.totalResults || 0;

  return (
    <div className="container-cine py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          KDrama <span className="text-primary">🇰🇷</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover the best Korean dramas — from heart-wrenching romance to
          edge-of-your-seat thrillers.
        </p>
      </div>

      {genres && genres.length > 0 && (
        <GenreFilter
          genres={genres}
          activeGenre={genreParam}
          baseHref="/kdrama"
          currentSort={sortParam}
        />
      )}

      <div className="flex items-center justify-between py-4 border-b border-border">
        <p className="text-xs text-muted-foreground">
          {totalResults.toLocaleString()} shows found
        </p>
        <SelectSort
          options={SORT_OPTIONS}
          currentSort={sortParam}
          baseHref="/kdrama"
          genre={genreParam}
          page={currentPage > 1 ? String(currentPage) : undefined}
        />
      </div>

      {shows.length > 0 && (
        <>
          <MediaGrid title="" items={shows} mediaType="tv" />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseHref="/kdrama"
              searchParams={{
                genre: genreParam || "",
                sort: sortParam !== "popularity.desc" ? sortParam : "",
              }}
            />
          )}
        </>
      )}

      {shows.length === 0 && !isLoading && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No KDramas found.</p>
          {genreParam && (
            <button
              onClick={() => {
                window.location.href = "/kdrama";
              }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 rounded-md transition-colors"
            >
              Clear genre filter
            </button>
          )}
        </div>
      )}

      {isLoading && kdramaData && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-full shadow-lg animate-pulse">
            <div className="h-2 w-2 bg-primary rounded-full" />
            <span className="text-xs text-muted-foreground">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component (thin wrapper for clarity)
// ---------------------------------------------------------------------------

export function KDramaClient() {
  return <KDramaClientInner />;
}
