"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/search/search-input";
import { MediaGrid } from "@/components/media/media-grid";
import { Pagination } from "@/components/ui/pagination";
import type { Movie, TVShow } from "@/types";
import { LoaderCircle, Film, Tv, Swords, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TMDB_BASE_URL } from "@/lib/constants";

function mapResult(r: any, fallbackType?: string): any {
  return {
    id: r.id,
    title: r.title || r.name,
    name: r.name,
    mediaType: r.media_type || fallbackType || "movie",
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

async function tmdbFetch(
  endpoint: string,
  query: string,
  page: number,
): Promise<any> {
  const url = new URL(`${TMDB_BASE_URL}/${endpoint}`);
  url.searchParams.set("api_key", process.env.NEXT_PUBLIC_TMDB_API_KEY!);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

const TYPE_FILTERS = [
  { value: "all", label: "All", icon: Grid3X3 },
  { value: "movie", label: "Movies", icon: Film },
  { value: "tv", label: "TV Shows", icon: Tv },
  { value: "anime", label: "Anime", icon: Swords },
];

export function SearchPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const urlQ = useMemo(() => sp.get("q") || "", [sp]);
  const urlType = useMemo(() => sp.get("type") || "all", [sp]);

  const [query, setQuery] = useState(urlQ);
  const [activeType, setActiveType] = useState(urlType);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const didInit = useRef(false);

  const performSearch = useCallback(
    async (searchQuery: string, searchPage = 1, type: string) => {
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
          const gql = `query($q:String,$page:Int){Page(page:$page,perPage:18){pageInfo{total perPage currentPage lastPage hasNextPage}media(search:$q,type:ANIME,sort:SEARCH_MATCH){id title{romaji english native}coverImage{large}format status episodes averageScore popularity genres season seasonYear}}}`;
          const res = await fetch("/api/anilist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              query: gql,
              variables: { q: searchQuery.trim(), page: searchPage },
            }),
          });
          if (!res.ok) throw new Error("Search failed");
          const json = await res.json();
          if (json.errors)
            throw new Error(json.errors[0]?.message ?? "AniList error");
          const pd = json.data.Page;
          setResults(
            pd.media.map((m: any) => ({
              id: m.id,
              title:
                m.title?.english ?? m.title?.romaji ?? m.title?.native ?? "",
              name: m.title?.english ?? m.title?.romaji ?? "",
              mediaType: "anime" as const,
              posterPath: m.coverImage?.large ?? "",
              backdropPath: null,
              overview: "",
              voteAverage: m.averageScore ? m.averageScore / 10 : 0,
              voteCount: m.popularity ?? 0,
              genreIds: [],
              releaseDate: m.seasonYear ? `${m.seasonYear}-01-01` : "",
              firstAirDate: m.seasonYear ? `${m.seasonYear}-01-01` : "",
              originalLanguage: "ja",
              popularity: m.popularity ?? 0,
              adult: false,
              runtime: null,
              numberOfSeasons: 1,
              numberOfEpisodes: m.episodes ?? 0,
              status: m.status ?? "NOT_YET_RELEASED",
              tagline: null,
              credits: { cast: [], crew: [] },
              similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
              videos: { results: [] },
            })),
          );
          setTotalPages(pd.pageInfo.lastPage || 1);
          setTotalResults(pd.pageInfo.total || 0);
        } else if (type === "all") {
          const data = await tmdbFetch(
            "search/multi",
            searchQuery.trim(),
            searchPage,
          );
          const filtered = (data.results || [])
            .filter((r: any) => r.media_type !== "person")
            .map((r: any) => mapResult(r));
          setResults(filtered);
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
        } else if (type === "movie") {
          const data = await tmdbFetch(
            "search/movie",
            searchQuery.trim(),
            searchPage,
          );
          setResults(
            (data.results || []).map((r: any) => mapResult(r, "movie")),
          );
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
        } else {
          const data = await tmdbFetch(
            "search/tv",
            searchQuery.trim(),
            searchPage,
          );
          setResults((data.results || []).map((r: any) => mapResult(r, "tv")));
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
        }
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

  // Auto-search on URL params (only once per unique urlQ+urlType)
  useEffect(() => {
    if (urlQ && !didInit.current) {
      didInit.current = true;
      setQuery(urlQ);
      setActiveType(urlType);
      performSearch(urlQ, 1, urlType);
    }
  }, [urlQ, urlType, performSearch]);

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
            autoFocus={!urlQ}
            initialValue={query}
          />
        </div>
      </form>
      <div className="flex items-center gap-2 mb-6">
        {TYPE_FILTERS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.value}
              onClick={() => handleTypeChange(f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors",
                activeType === f.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {f.label}
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
