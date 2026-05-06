"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/search/search-input";
import { MediaGrid } from "@/components/media/media-grid";
import { Pagination } from "@/components/ui/pagination";
import type { Movie, TVShow } from "@/types";
import { LoaderCircle, Film, Tv, Swords, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

// Snake_case → camelCase mappers for raw TMDB API results
function mapResult(r: any): any {
  return {
    id: r.id,
    title: r.title || r.name,
    name: r.name,
    mediaType: r.media_type || "movie",
    posterPath: r.poster_path,
    backdropPath: r.backdrop_path,
    overview: r.overview,
    voteAverage: r.vote_average,
    voteCount: r.vote_count,
    genreIds: r.genre_ids || [],
    releaseDate: r.release_date,
    firstAirDate: r.first_air_date,
    originalLanguage: r.original_language,
    popularity: r.popularity,
    adult: r.adult,
    profilePath: r.profile_path,
    runtime: r.runtime,
    numberOfSeasons: r.number_of_seasons,
    numberOfEpisodes: r.number_of_episodes,
    status: r.status,
    tagline: r.tagline,
    credits: { cast: [], crew: [] },
    similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
    videos: { results: [] },
  };
}

const TYPE_FILTERS = [
  { value: "all", label: "All", icon: Grid3X3 },
  { value: "movie", label: "Movies", icon: Film },
  { value: "tv", label: "TV Shows", icon: Tv },
  { value: "anime", label: "Anime", icon: Swords },
];

interface SearchPageClientProps {
  initialQuery: string;
  initialType: string;
}

export function SearchPageClient({
  initialQuery,
  initialType,
}: SearchPageClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState(initialType);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  const performSearch = useCallback(
    async (
      searchQuery: string,
      searchPage: number = 1,
      type: string = activeType,
    ) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        if (type === "anime") {
          const params = new URLSearchParams({
            page: String(searchPage),
            sort_by: "popularity.desc",
            with_genres: "16",
            with_original_language: "ja",
            include_adult: "false",
          });
          const res = await fetch(`/api/tmdb/discover/tv?${params}`);
          if (!res.ok) throw new Error("Search failed");
          const data = await res.json();
          const filtered = (data.results || [])
            .filter((r: any) =>
              (r.name || r.title || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
            )
            .map(mapResult);
          setResults(filtered);
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
          setPage(searchPage);
        } else if (type === "all") {
          const params = new URLSearchParams({
            query: searchQuery.trim(),
            page: String(searchPage),
          });
          const res = await fetch(`/api/tmdb/search/multi?${params}`);
          if (!res.ok) throw new Error("Search failed");
          const data = await res.json();
          const filtered = (data.results || [])
            .filter((r: any) => r.media_type !== "person")
            .map(mapResult);
          setResults(filtered);
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
          setPage(searchPage);
        } else if (type === "movie") {
          const params = new URLSearchParams({
            query: searchQuery.trim(),
            page: String(searchPage),
          });
          const res = await fetch(`/api/tmdb/search/movie?${params}`);
          if (!res.ok) throw new Error("Search failed");
          const data = await res.json();
          setResults((data.results || []).map(mapResult));
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
          setPage(searchPage);
        } else {
          const params = new URLSearchParams({
            query: searchQuery.trim(),
            page: String(searchPage),
          });
          const res = await fetch(`/api/tmdb/search/tv?${params}`);
          if (!res.ok) throw new Error("Search failed");
          const data = await res.json();
          setResults((data.results || []).map(mapResult));
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
          setPage(searchPage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeType],
  );

  useEffect(() => {
    if (initialQuery) performSearch(initialQuery, 1, initialType);
  }, [initialQuery, initialType, performSearch]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(
          `/search?q=${encodeURIComponent(query.trim())}&type=${activeType}`,
        );
        performSearch(query.trim(), 1, activeType);
      }
    },
    [query, activeType, router, performSearch],
  );

  const handleTypeChange = useCallback(
    (type: string) => {
      setActiveType(type);
      if (query.trim()) {
        router.push(
          `/search?q=${encodeURIComponent(query.trim())}&type=${type}`,
        );
        performSearch(query.trim(), 1, type);
      }
    },
    [query, router, performSearch],
  );

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center gap-3">
          <SearchInput
            className="flex-1"
            placeholder="Search movies, TV shows, anime..."
            autoFocus={!initialQuery}
            initialValue={query}
          />
        </div>
      </form>

      <div className="flex items-center gap-2 mb-6">
        {TYPE_FILTERS.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => handleTypeChange(filter.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors",
                activeType === filter.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {filter.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-mono">
              Searching...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="py-20 text-center">
          <p className="text-destructive mb-2">Error: {error}</p>
          <button
            onClick={() => performSearch(query.trim(), 1, activeType)}
            className="text-sm text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && hasSearched && results.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-lg mb-2">No results found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            {totalResults.toLocaleString()} results found
          </p>
          <MediaGrid
            title=""
            items={results as any}
            mediaType={
              activeType === "anime"
                ? "anime"
                : activeType === "tv"
                  ? "tv"
                  : "movie"
            }
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseHref="/search"
              searchParams={{
                q: query,
                type: activeType !== "all" ? activeType : "",
              }}
            />
          )}
        </>
      )}

      {!isLoading && !error && !hasSearched && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            Start typing to search for movies, TV shows, and anime.
          </p>
        </div>
      )}
    </div>
  );
}
