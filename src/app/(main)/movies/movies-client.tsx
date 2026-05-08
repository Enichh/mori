"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import type { Movie, Genre } from "@/types";
import { Loader2, AlertTriangle, ChevronDown } from "lucide-react";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

interface CountryOption {
  code: string;
  label: string;
  tag: string;
  language: string;
}

const REGIONS: CountryOption[] = [
  { code: "US", label: "Hollywood", tag: "US", language: "en" },
  { code: "GB", label: "British", tag: "GB", language: "en" },
  { code: "KR", label: "Korean", tag: "KR", language: "ko" },
  { code: "JP", label: "Japanese", tag: "JP", language: "ja" },
  { code: "CN", label: "Chinese", tag: "CN", language: "zh" },
  { code: "FR", label: "French", tag: "FR", language: "fr" },
  { code: "IN", label: "Bollywood", tag: "IN", language: "hi" },
  { code: "ID", label: "Indonesian", tag: "ID", language: "id" },
  { code: "TH", label: "Thai", tag: "TH", language: "th" },
  { code: "TW", label: "Taiwanese", tag: "TW", language: "zh" },
  { code: "DE", label: "German", tag: "DE", language: "de" },
  { code: "ES", label: "Spanish", tag: "ES", language: "es" },
  { code: "MX", label: "Mexican", tag: "MX", language: "es" },
  { code: "BR", label: "Brazilian", tag: "BR", language: "pt" },
  { code: "IT", label: "Italian", tag: "IT", language: "it" },
  { code: "AU", label: "Australian", tag: "AU", language: "en" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest" },
  { value: "revenue.desc", label: "Top Grossing" },
  { value: "primary_release_date.desc", label: "Latest Release" },
];

const YEAR_OPTIONS = [
  { value: "", label: "All Years" },
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
  { value: "2020", label: "2020" },
  { value: "2010-01-01|2019-12-31", label: "2010s" },
  { value: "2000-01-01|2009-12-31", label: "2000s" },
  { value: "1990-01-01|1999-12-31", label: "1990s" },
  { value: "1980-01-01|1989-12-31", label: "1980s" },
  { value: "1900-01-01|1979-12-31", label: "Older" },
];

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapMovie(r: any): Movie {
  return {
    id: r.id,
    mediaType: "movie",
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

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

interface MoviesData {
  movies: Movie[];
  totalPages: number;
  totalResults: number;
}

async function fetchMovies(
  page: number,
  region: CountryOption,
  genre?: string,
  sort?: string,
  year?: string,
): Promise<MoviesData> {
  const params = new URLSearchParams();
  params.set("api_key", TMDB_KEY);
  params.set("sort_by", sort || "popularity.desc");
  params.set("page", String(page));
  params.set("with_original_language", region.language);
  // Don't set origin_country for US/GB since it's too restrictive for Hollywood
  if (!["US", "GB", "AU"].includes(region.code)) {
    params.set("with_origin_country", region.code);
  }
  if (genre) params.set("with_genres", genre);
  if (sort === "vote_average.desc") params.set("vote_count.gte", "50");

  // Year filter: supports both single year and date range
  if (year) {
    if (year.includes("|")) {
      const [from, to] = year.split("|");
      params.set("release_date.gte", from);
      params.set("release_date.lte", to);
    } else {
      params.set("primary_release_year", year);
    }
  }

  // Filter out Filipino content
  params.set("without_original_language", "tl");

  const res = await fetch(`${TMDB_BASE}/discover/movie?${params.toString()}`);
  if (!res.ok) return { movies: [], totalPages: 0, totalResults: 0 };
  const data = await res.json();
  return {
    movies: (data.results || []).map(mapMovie),
    totalPages: Math.min(data.total_pages || 0, 500),
    totalResults: data.total_results || 0,
  };
}

async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres || [];
}

// ---------------------------------------------------------------------------
// Dropdown
// ---------------------------------------------------------------------------

function SelectDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-card border border-border rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-foreground cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function MoviesSkeleton() {
  return (
    <div className="container-cine py-8">
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
      <div className="flex flex-wrap gap-2 mb-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-muted rounded" />
        ))}
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
// Main
// ---------------------------------------------------------------------------

export function MoviesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get("page") || "1";
  const regionParam = searchParams.get("region") || "US";
  const genreParam = searchParams.get("genre") || undefined;
  const sortParam = searchParams.get("sort") || "popularity.desc";
  const yearParam = searchParams.get("year") || "";

  const currentPage = parseInt(pageParam, 10) || 1;
  const region = REGIONS.find((r) => r.code === regionParam) ?? REGIONS[0];

  const cacheKey = `movies:${currentPage}:${region.code}:${genreParam || "all"}:${sortParam}:${yearParam || "all"}`;

  const {
    data: moviesData,
    loading,
    error,
    refetch,
  } = useCachedFetch<MoviesData>(
    cacheKey,
    () => fetchMovies(currentPage, region, genreParam, sortParam, yearParam),
    3600000,
  );

  const { data: genres, loading: genresLoading } = useCachedFetch<Genre[]>(
    "movies:genres",
    fetchGenres,
    86400000,
  );

  const navigate = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    if (!("page" in updates)) sp.delete("page");
    router.push(`/movies?${sp.toString()}`, { scroll: false });
  };

  // ---- Loading ----
  if (loading && !moviesData) return <MoviesSkeleton />;

  // ---- Error ----
  if (error && !moviesData) {
    return (
      <div className="container-cine py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="text-destructive text-sm mb-3">{error}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  const movies = moviesData?.movies || [];
  const totalPages = moviesData?.totalPages || 0;
  const totalResults = moviesData?.totalResults || 0;

  return (
    <div className="container-cine py-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Movies
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse blockbusters, classics, and hidden gems from around the world.
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SelectDropdown
          label="Region"
          value={region.code}
          options={REGIONS.map((r) => ({
            value: r.code,
            label: `${r.label}`,
          }))}
          onChange={(v) => navigate({ region: v })}
        />

        <SelectDropdown
          label="Year"
          value={yearParam}
          options={YEAR_OPTIONS}
          onChange={(v) => navigate({ year: v })}
        />

        <SelectDropdown
          label="Sort"
          value={sortParam}
          options={SORT_OPTIONS}
          onChange={(v) => navigate({ sort: v })}
        />

        <div className="flex items-center gap-2 ml-auto">
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded border border-primary/30 bg-primary/10 text-primary">
            {region.tag}
          </span>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {totalResults.toLocaleString()} movies
          </p>
        </div>
      </div>

      {/* Genre filter */}
      {genres && genres.length > 0 && (
        <div className="mb-4">
          <GenreFilter
            genres={genres}
            activeGenre={genreParam}
            baseHref="/movies"
            currentSort={
              sortParam !== "popularity.desc" ? sortParam : undefined
            }
            extraParams={{
              region: region.code !== "US" ? region.code : "",
              year: yearParam,
            }}
          />
        </div>
      )}

      {/* Grid */}
      {movies.length > 0 && (
        <>
          <MediaGrid title="" items={movies} mediaType="movie" />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseHref="/movies"
              searchParams={{
                region: region.code !== "US" ? region.code : "",
                year: yearParam,
                sort: sortParam !== "popularity.desc" ? sortParam : "",
                genre: genreParam || "",
              }}
            />
          )}
        </>
      )}

      {/* Empty */}
      {movies.length === 0 && !loading && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            No {region.label} movies found
            {yearParam
              ? ` for ${YEAR_OPTIONS.find((y) => y.value === yearParam)?.label}`
              : ""}
            .
          </p>
          {genreParam && (
            <button
              onClick={() => navigate({ genre: undefined })}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 rounded-md transition-colors"
            >
              Clear genre filter
            </button>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {loading && moviesData && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-full shadow-lg">
            <Loader2 className="w-3 h-3 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}
