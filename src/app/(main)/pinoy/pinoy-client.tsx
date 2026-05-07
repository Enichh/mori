"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { SelectSort } from "@/components/ui/select-sort";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import type { Movie, TVShow, Genre } from "@/types";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";

const SORT_OPTIONS = [
  { value: "popularity.desc" as const, label: "Most Popular" },
  { value: "vote_average.desc" as const, label: "Highest Rated" },
  { value: "release_date.desc" as const, label: "Newest" },
];

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapMovie(r: any): Movie {
  return {
    id: r.id,
    mediaType: "movie" as const,
    title: r.title,
    originalTitle: r.original_title,
    overview: r.overview,
    posterPath: r.poster_path,
    backdropPath: r.backdrop_path,
    voteAverage: r.vote_average,
    voteCount: r.vote_count,
    genreIds: r.genre_ids || [],
    popularity: r.popularity,
    originalLanguage: r.original_language,
    adult: r.adult,
    releaseDate: r.release_date,
    runtime: null,
    budget: 0,
    revenue: 0,
    status: "",
    tagline: null,
    credits: { cast: [], crew: [] },
    similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
    videos: { results: [] },
  } as Movie;
}

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

interface MoviesData {
  movies: Movie[];
  totalPages: number;
  totalResults: number;
}

// ---------------------------------------------------------------------------
// Fetchers (run in browser)
// ---------------------------------------------------------------------------

async function fetchPinoyMovies(
  page: number,
  genre?: string,
  sort?: string,
): Promise<MoviesData> {
  const params = new URLSearchParams();
  params.set("api_key", TMDB_KEY);
  params.set("sort_by", sort || "popularity.desc");
  params.set("page", String(page));
  params.set("with_original_language", "tl");
  params.set("with_origin_country", "PH");
  if (genre) params.set("with_genres", genre);

  const res = await fetch(
    `${TMDB_BASE}/discover/movie?${params.toString()}`,
  );
  if (!res.ok) return { movies: [], totalPages: 0, totalResults: 0 };
  const data = await res.json();
  return {
    movies: (data.results || []).map(mapMovie),
    totalPages: Math.min(data.total_pages || 0, 500),
    totalResults: data.total_results || 0,
  };
}

async function fetchPinoyTV(): Promise<TVShow[]> {
  const params = new URLSearchParams();
  params.set("api_key", TMDB_KEY);
  params.set("sort_by", "popularity.desc");
  params.set("with_original_language", "tl");
  params.set("with_origin_country", "PH");

  const res = await fetch(
    `${TMDB_BASE}/discover/tv?${params.toString()}`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 12).map(mapTVShow);
}

async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres || [];
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PinoySkeleton() {
  return (
    <div className="container-cine py-8">
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-56 bg-muted rounded mb-2" />
        <div className="h-4 w-80 bg-muted rounded" />
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

function PinoyClientInner() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const genreParam = searchParams.get("genre") || undefined;
  const sortParam = searchParams.get("sort") || "popularity.desc";

  const currentPage = parseInt(pageParam, 10) || 1;

  const cacheKey = `pinoy:${currentPage}:${genreParam || "all"}:${sortParam}`;

  const {
    data: moviesData,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useCachedFetch<MoviesData>(
    cacheKey,
    () => fetchPinoyMovies(currentPage, genreParam, sortParam),
    3600000,
  );

  const {
    data: genres,
    loading: genresLoading,
    error: genresError,
  } = useCachedFetch<Genre[]>("pinoy:genres", fetchGenres, 86400000);

  const {
    data: pinoyTV,
    loading: tvLoading,
    error: tvError,
  } = useCachedFetch<TVShow[]>("pinoy:tv", fetchPinoyTV, 3600000);

  const isLoading = moviesLoading || genresLoading || tvLoading;
  const hasError = moviesError || genresError || tvError;

  // ---- Loading state ----
  if (isLoading && !moviesData) {
    return <PinoySkeleton />;
  }

  // ---- Error state ----
  if (hasError && !moviesData) {
    return (
      <div className="container-cine py-20 text-center">
        <div className="terminal-box max-w-md mx-auto">
          <p className="text-destructive text-sm mb-3">
            Failed to load Pinoy content.
          </p>
          {moviesError && (
            <p className="text-muted-foreground text-xs font-mono break-all mb-4">
              {moviesError}
            </p>
          )}
          {genresError && (
            <p className="text-muted-foreground text-xs font-mono break-all mb-4">
              {genresError}
            </p>
          )}
          {tvError && (
            <p className="text-muted-foreground text-xs font-mono break-all mb-4">
              {tvError}
            </p>
          )}
          <button
            onClick={() => refetchMovies()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const movies = moviesData?.movies || [];
  const totalPages = moviesData?.totalPages || 0;
  const totalResults = moviesData?.totalResults || 0;

  return (
    <div className="container-cine py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Pinoy Movies & TV <span className="text-primary">🇵🇭</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Stream the best Filipino movies and TV shows in Tagalog.
        </p>
      </div>

      {genres && genres.length > 0 && (
        <GenreFilter
          genres={genres}
          activeGenre={genreParam}
          baseHref="/pinoy"
          currentSort={sortParam}
        />
      )}

      <div className="flex items-center justify-between py-4 border-b border-border">
        <p className="text-xs text-muted-foreground">
          {totalResults.toLocaleString()} movies found
        </p>
        <SelectSort
          options={SORT_OPTIONS}
          currentSort={sortParam}
          baseHref="/pinoy"
          genre={genreParam}
          page={currentPage > 1 ? String(currentPage) : undefined}
        />
      </div>

      {movies.length > 0 && (
        <>
          <MediaGrid title="" items={movies} mediaType="movie" />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseHref="/pinoy"
              searchParams={{
                genre: genreParam || "",
                sort: sortParam !== "popularity.desc" ? sortParam : "",
              }}
            />
          )}
        </>
      )}

      {movies.length === 0 && !isLoading && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No Pinoy movies found.</p>
          {genreParam && (
            <button
              onClick={() => {
                window.location.href = "/pinoy";
              }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 rounded-md transition-colors"
            >
              Clear genre filter
            </button>
          )}
        </div>
      )}

      {/* Pinoy TV section (secondary, no pagination) */}
      {pinoyTV && pinoyTV.length > 0 && (
        <div className="mt-12">
          <MediaGrid title="Pinoy TV Shows" items={pinoyTV} mediaType="tv" />
        </div>
      )}

      {isLoading && moviesData && (
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

export function PinoyClient() {
  return <PinoyClientInner />;
}
