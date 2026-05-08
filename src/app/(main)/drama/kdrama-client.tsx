"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import type { TVShow, Genre } from "@/types";
import { Loader2, AlertTriangle, ChevronDown } from "lucide-react";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";

// ---------------------------------------------------------------------------
// Country & media options
// ---------------------------------------------------------------------------

interface CountryOption {
  code: string;
  label: string;
  tag: string;
  language: string;
}

const COUNTRIES: CountryOption[] = [
  { code: "KR", label: "K-Drama", tag: "KR", language: "ko" },
  { code: "CN", label: "C-Drama", tag: "CN", language: "zh" },
  { code: "JP", label: "J-Drama", tag: "JP", language: "ja" },
  { code: "ID", label: "Indonesian", tag: "ID", language: "id" },
  { code: "TH", label: "Thai", tag: "TH", language: "th" },
  { code: "TW", label: "Taiwanese", tag: "TW", language: "zh" },
  { code: "IN", label: "Indian", tag: "IN", language: "hi" },
];

const MEDIA_OPTIONS = [
  { value: "tv", label: "TV Shows" },
  { value: "movie", label: "Movies" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "first_air_date.desc", label: "Newest" },
  { value: "revenue.desc", label: "Top Grossing" },
];

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapTVShow(r: any): TVShow {
  return {
    id: r.id,
    mediaType: "tv" as const,
    title: r.name ?? r.title,
    name: r.name,
    originalName: r.original_name ?? r.original_title,
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

function mapMovieToTVShow(r: any): TVShow {
  return {
    id: r.id,
    mediaType: "movie" as any,
    title: r.title,
    name: r.title,
    originalName: r.original_title,
    overview: r.overview,
    posterPath: r.poster_path,
    backdropPath: r.backdrop_path,
    voteAverage: r.vote_average,
    voteCount: r.vote_count,
    genreIds: r.genre_ids || [],
    popularity: r.popularity,
    originalLanguage: r.original_language,
    adult: r.adult,
    firstAirDate: r.release_date,
    lastAirDate: null,
    numberOfSeasons: 0,
    numberOfEpisodes: 0,
    status: "",
    seasons: [],
    credits: { cast: [], crew: [] },
    similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
    videos: { results: [] },
    nextEpisodeToAir: null,
  } as unknown as TVShow;
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

interface DramaPageData {
  shows: TVShow[];
  totalPages: number;
  totalResults: number;
}

async function fetchDrama(
  page: number,
  country: CountryOption,
  media: string,
  genre?: string,
  sort?: string,
): Promise<DramaPageData> {
  const isMovie = media === "movie";
  const endpoint = isMovie ? "discover/movie" : "discover/tv";
  const params = new URLSearchParams();
  params.set("api_key", TMDB_KEY);
  params.set("sort_by", sort || "popularity.desc");
  params.set("page", String(page));
  params.set("with_original_language", country.language);
  if (country.code !== "IN") params.set("with_origin_country", country.code);
  // For highly rated, require a minimum vote count
  if (sort === "vote_average.desc") params.set("vote_count.gte", "50");
  if (genre) params.set("with_genres", genre);

  const res = await fetch(`${TMDB_BASE}/${endpoint}?${params.toString()}`);
  if (!res.ok) return { shows: [], totalPages: 0, totalResults: 0 };
  const data = await res.json();
  return {
    shows: (data.results || []).map(isMovie ? mapMovieToTVShow : mapTVShow),
    totalPages: Math.min(data.total_pages || 0, 500),
    totalResults: data.total_results || 0,
  };
}

async function fetchGenres(media: string): Promise<Genre[]> {
  const endpoint = media === "movie" ? "genre/movie/list" : "genre/tv/list";
  const res = await fetch(`${TMDB_BASE}/${endpoint}?api_key=${TMDB_KEY}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres || [];
}

// ---------------------------------------------------------------------------
// Dropdown component
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

function DramaSkeleton() {
  return (
    <div className="container-cine py-8">
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-96 bg-muted rounded" />
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

export function KDramaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get("page") || "1";
  const countryParam = searchParams.get("country") || "KR";
  const mediaParam = searchParams.get("media") || "tv";
  const genreParam = searchParams.get("genre") || undefined;
  const sortParam = searchParams.get("sort") || "popularity.desc";

  const currentPage = parseInt(pageParam, 10) || 1;
  const country =
    COUNTRIES.find((c) => c.code === countryParam) ?? COUNTRIES[0];
  const media = mediaParam === "movie" ? "movie" : "tv";

  const cacheKey = `drama:${currentPage}:${country.code}:${media}:${genreParam || "all"}:${sortParam}`;

  const {
    data: dramaData,
    loading,
    error,
  } = useCachedFetch<DramaPageData>(
    cacheKey,
    () => fetchDrama(currentPage, country, media, genreParam, sortParam),
    3600000,
  );

  const { data: genres, loading: genresLoading } = useCachedFetch<Genre[]>(
    `drama:genres:${media}`,
    () => fetchGenres(media),
    86400000,
  );

  const navigate = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    // Reset page when changing filters
    if (!("page" in updates)) sp.delete("page");
    router.push(`/drama?${sp.toString()}`, { scroll: false });
  };

  // ---- Loading ----
  if (loading && !dramaData) return <DramaSkeleton />;

  // ---- Error ----
  if (error && !dramaData) {
    return (
      <div className="container-cine py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="text-destructive text-sm mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  const shows = dramaData?.shows || [];
  const totalPages = dramaData?.totalPages || 0;
  const totalResults = dramaData?.totalResults || 0;

  return (
    <div className="container-cine py-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Drama
        </h1>
        <p className="text-sm text-muted-foreground">
          Asian dramas & movies from Korea, China, Japan, Indonesia, Thailand &
          more.
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SelectDropdown
          label="Country"
          value={country.code}
          options={COUNTRIES.map((c) => ({
            value: c.code,
            label: `${c.label}`,
          }))}
          onChange={(v) => navigate({ country: v })}
        />

        <SelectDropdown
          label="Type"
          value={media}
          options={MEDIA_OPTIONS}
          onChange={(v) => navigate({ media: v })}
        />

        <SelectDropdown
          label="Sort"
          value={sortParam}
          options={SORT_OPTIONS}
          onChange={(v) => navigate({ sort: v })}
        />

        <div className="flex items-center gap-2 ml-auto">
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded border border-primary/30 bg-primary/10 text-primary">
            {country.tag}
          </span>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {totalResults.toLocaleString()} found
          </p>
        </div>
      </div>

      {/* Genre filter */}
      {genres && genres.length > 0 && (
        <div className="mb-4">
          <GenreFilter
            genres={genres}
            activeGenre={genreParam}
            baseHref="/drama"
            currentSort={
              sortParam !== "popularity.desc" ? sortParam : undefined
            }
            extraParams={{ country: country.code, media }}
          />
        </div>
      )}

      {/* Grid */}
      {shows.length > 0 && (
        <>
          <MediaGrid
            title=""
            items={shows}
            mediaType={media === "movie" ? "movie" : "tv"}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseHref="/drama"
              searchParams={{
                country: country.code !== "KR" ? country.code : "",
                media: media !== "tv" ? media : "",
                sort: sortParam !== "popularity.desc" ? sortParam : "",
                genre: genreParam || "",
              }}
            />
          )}
        </>
      )}

      {/* Empty state */}
      {shows.length === 0 && !loading && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            No {country.label} {media === "movie" ? "movies" : "shows"} found.
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
      {loading && dramaData && (
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
