"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { Loader2, ChevronDown } from "lucide-react";
import type { Genre } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

import { ANILIST_BASE_URL } from "@/lib/constants";
const ANILIST_API = ANILIST_BASE_URL;

const SORT_OPTIONS = [
  { value: "TRENDING_DESC" as const, label: "Trending" },
  { value: "POPULARITY_DESC" as const, label: "Most Popular" },
  { value: "SCORE_DESC" as const, label: "Highest Rated" },
  { value: "START_DATE_DESC" as const, label: "Newest" },
];

const GENRES: Genre[] = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
  "Mecha",
  "Music",
  "Ecchi",
].map((name, i) => ({ id: i + 1, name }));

const PAGE_SIZE = 18;
const CACHE_TTL = 3600000; // 1 hour

const SEASON_OPTIONS = [
  { value: "", label: "All" },
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
];

function generateYears(): { value: string; label: string }[] {
  const years = [{ value: "", label: "All Years" }];
  for (let y = 2026; y >= 1960; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

const YEAR_OPTIONS = generateYears();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AniListPageInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

interface AniListMedia {
  id: number;
  title: { romaji?: string; english?: string; native?: string };
  coverImage: { large?: string; medium?: string };
  format?: string;
  status?: string;
  episodes?: number | null;
  averageScore?: number | null;
  popularity?: number;
  genres?: string[];
  season?: string | null;
  seasonYear?: number | null;
  description?: string | null;
  bannerImage?: string | null;
}

interface AniListPage {
  pageInfo: AniListPageInfo;
  media: AniListMedia[];
}

interface CacheEntry {
  data: {
    results: ReturnType<typeof mapMedia>[];
    totalResults: number;
    totalPages: number;
  };
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function mapMedia(a: AniListMedia) {
  return {
    id: a.id,
    mediaType: "anime" as const,
    title: a.title?.english ?? a.title?.romaji ?? a.title?.native ?? "",
    name: a.title?.english ?? a.title?.romaji ?? a.title?.native ?? "",
    originalName: a.title?.native ?? "",
    overview: a.description ?? "",
    posterPath: a.coverImage?.large ?? a.coverImage?.medium ?? null,
    backdropPath: a.bannerImage ?? null,
    voteAverage: a.averageScore ? a.averageScore / 10 : 0,
    voteCount: a.popularity ?? 0,
    genreIds: [] as number[],
    popularity: a.popularity ?? 0,
    originalLanguage: "ja",
    adult: false,
    firstAirDate: a.seasonYear ? `${a.seasonYear}-01-01` : "",
    lastAirDate: "",
    numberOfSeasons: 1,
    numberOfEpisodes: a.episodes ?? 0,
    status: a.status ?? "NOT_YET_RELEASED",
    seasons: [] as any[],
    credits: { cast: [] as any[], crew: [] as any[] },
    similar: { page: 1, results: [] as any[], totalPages: 1, totalResults: 0 },
    videos: { results: [] as any[] },
    nextEpisodeToAir: null,
  };
}

// ---------------------------------------------------------------------------
// GraphQL query builder & fetcher
// ---------------------------------------------------------------------------

function buildQuery(
  hasGenre: boolean,
  hasSeason: boolean,
  hasYear: boolean,
): string {
  const varDecls = ["$page: Int", "$sort: [MediaSort]"];
  let mediaArgs = "type: ANIME, sort: $sort";

  if (hasGenre) {
    varDecls.push("$genre: String");
    mediaArgs += ", genre: $genre";
  }
  if (hasSeason) {
    varDecls.push("$season: MediaSeason");
    mediaArgs += ", season: $season";
  }
  if (hasYear) {
    varDecls.push("$seasonYear: Int");
    mediaArgs += ", seasonYear: $seasonYear";
  }

  return `query (${varDecls.join(", ")}) {
    Page(page: $page, perPage: ${PAGE_SIZE}) {
      pageInfo { total perPage currentPage lastPage hasNextPage }
      media(${mediaArgs}) {
        id
        title { romaji english native }
        coverImage { large }
        format
        status
        episodes
        averageScore
        popularity
        genres
        season
        seasonYear
      }
    }
  }`;
}

async function fetchAnime(
  page: number,
  sort: string,
  genreName?: string,
  season?: string,
  seasonYear?: string,
): Promise<{
  results: ReturnType<typeof mapMedia>[];
  totalResults: number;
  totalPages: number;
}> {
  const hasGenre = Boolean(genreName);
  const hasSeason = Boolean(season);
  const hasYear = Boolean(seasonYear);
  const query = buildQuery(hasGenre, hasSeason, hasYear);
  const variables: Record<string, unknown> = { page, sort };
  if (genreName) variables.genre = genreName;
  if (season) variables.season = season;
  if (seasonYear) variables.seasonYear = parseInt(seasonYear, 10);

  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(
      `AniList ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`,
    );
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "AniList GraphQL error");
  }

  const pageData: AniListPage = json.data.Page;
  return {
    results: pageData.media.map(mapMedia),
    totalResults: pageData.pageInfo.total,
    totalPages: pageData.pageInfo.lastPage,
  };
}

function getCacheKey(
  page: number,
  sort: string,
  genre?: string,
  season?: string,
  year?: string,
): string {
  return `mori:cache:anime:discover:${page}:${genre ?? "all"}:${sort}:${season ?? "all"}:${year ?? "all"}`;
}

function readCache(key: string): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp < CACHE_TTL) return entry;
  } catch {
    // corrupted cache
  }
  return null;
}

function writeCache(key: string, data: CacheEntry["data"]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Dropdown (reused across sections)
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

function SeasonToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground whitespace-nowrap mr-1">
        Season
      </span>
      {SEASON_OPTIONS.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-all ${
            s.value === value
              ? "bg-primary/20 text-primary border-primary/40"
              : "border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 bg-transparent"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnimeClient() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const genre = searchParams.get("genre") ?? undefined;
  const sort = searchParams.get("sort") || "TRENDING_DESC";
  const season = searchParams.get("season") || "";
  const year = searchParams.get("year") || "";

  const genreName = genre
    ? GENRES.find((g) => String(g.id) === genre)?.name
    : undefined;

  const cacheKey = getCacheKey(page, sort, genre, season, year);

  const [data, setData] = React.useState<CacheEntry["data"] | null>(() => {
    const cached = readCache(cacheKey);
    return cached?.data ?? null;
  });
  const [loading, setLoading] = React.useState(!data);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      // Check cache first for the current key
      const cached = readCache(cacheKey);
      if (cached?.data && !cancelled) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchAnime(
          page,
          sort,
          genreName,
          season || undefined,
          year || undefined,
        );
        if (cancelled) return;
        setData(result);
        writeCache(cacheKey, result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch anime",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, page, sort, genreName, season, year]);

  const mediaItems = data?.results ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalResults = data?.totalResults ?? 0;

  const navigate = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    if (!("page" in updates)) sp.delete("page");
    window.location.href = `/anime?${sp.toString()}`;
  };

  // ---- Loading ----
  if (loading && mediaItems.length === 0) {
    return (
      <div className="container-cine py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            Anime
          </h1>
          <p className="text-sm text-muted-foreground">
            Discover the best anime from Japan and beyond — powered by AniList.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error && mediaItems.length === 0) {
    return (
      <div className="container-cine py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            Anime
          </h1>
        </div>
        <div className="py-20 text-center">
          <p className="text-destructive mb-2">Failed to load anime</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-cine py-8">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Anime
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover the best anime from Japan and beyond — powered by AniList.
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SeasonToggle
          value={season}
          onChange={(v) => navigate({ season: v })}
        />

        <SelectDropdown
          label="Year"
          value={year}
          options={YEAR_OPTIONS}
          onChange={(v) => navigate({ year: v })}
        />

        <SelectDropdown
          label="Sort"
          value={sort}
          options={SORT_OPTIONS}
          onChange={(v) => navigate({ sort: v })}
        />

        <div className="flex items-center gap-2 ml-auto">
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {totalResults.toLocaleString()} anime found
          </p>
        </div>
      </div>

      <GenreFilter
        genres={GENRES}
        activeGenre={genre}
        baseHref="/anime"
        currentSort={sort}
        extraParams={{ season, year }}
      />

      {mediaItems.length > 0 && (
        <MediaGrid title="" items={mediaItems} mediaType="anime" />
      )}

      {mediaItems.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No anime found.</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseHref="/anime"
          searchParams={{
            genre: genre || "",
            season,
            year,
            sort: sort !== "TRENDING_DESC" ? sort : "",
          }}
        />
      )}
    </div>
  );
}
