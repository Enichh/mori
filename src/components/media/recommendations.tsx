"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, LoaderCircle } from "lucide-react";
import { getPosterUrl } from "@/lib/tmdb-image";
import { getWatchHistory } from "@/lib/watch-history";
import type { WatchProgress } from "@/types";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";

// ---- Genre helpers ----
interface GenreCount {
  id: number;
  name: string;
  score: number;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10765: "Sci-Fi & Fantasy",
};

async function fetchGenreIds(tmdbId: number, mediaType: string): Promise<number[]> {
  try {
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const res = await fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}?api_key=${TMDB_KEY}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.genres ? data.genres.map((g: any) => g.id) : [];
  } catch {
    return [];
  }
}

/**
 * Analyze watch history with recency weighting.
 * Most recent item = weight N (where N = number of items analyzed),
 * oldest = weight 1. So if you binge 4 action films, then switch to
 * drama, the drama genres will quickly outscore the action ones.
 */
async function fetchTopGenres(history: WatchProgress[]): Promise<GenreCount[]> {
  const pool = history.slice(0, 8);
  if (pool.length === 0) return [];

  const genreScore: Record<number, number> = {};

  const results = await Promise.all(
    pool.map((h) => fetchGenreIds(h.id, h.mediaType)),
  );

  // Weight: position 0 (newest) = len, position N-1 (oldest) = 1
  for (let i = 0; i < results.length; i++) {
    const weight = pool.length - i;
    for (const g of results[i]) {
      genreScore[g] = (genreScore[g] || 0) + weight;
    }
  }

  return Object.entries(genreScore)
    .map(([id, score]) => ({
      id: Number(id),
      name: GENRE_MAP[Number(id)] || "Other",
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

async function fetchRecs(genreIds: number[]): Promise<any[]> {
  if (genreIds.length === 0) return [];
  try {
    const genreParam = genreIds.join(",");
    const res = await fetch(
      `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreParam}&sort_by=popularity.desc&vote_count.gte=100&page=1`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 12).map((r: any) => ({
      id: r.id,
      title: r.title,
      posterPath: r.poster_path,
      voteAverage: r.vote_average,
      releaseDate: r.release_date,
      genreIds: r.genre_ids || [],
    }));
  } catch {
    return [];
  }
}

// ---- Component ----
export function Recommendations() {
  const [recs, setRecs] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [topGenres, setTopGenres] = React.useState<GenreCount[]>([]);
  const mountedRef = React.useRef(false);

  const loadRecs = React.useCallback(async () => {
    const history = getWatchHistory();
    if (!history.length) {
      setRecs(null);
      setTopGenres([]);
      return;
    }

    setLoading(true);
    const genres = await fetchTopGenres(history);
    setTopGenres(genres);
    const genreIds = genres.map((g) => g.id);
    const results = await fetchRecs(genreIds);
    setRecs(results);
    setLoading(false);
  }, []);

  // Initial load + react to history changes (add/remove)
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadRecs();
    }

    const onHistoryChange = () => loadRecs();
    window.addEventListener("mori:history-updated", onHistoryChange);
    return () => window.removeEventListener("mori:history-updated", onHistoryChange);
  }, [loadRecs]);

  if (loading) {
    return (
      <section className="py-4">
        <div className="container-cine">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-heading font-bold text-foreground">For You</h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <LoaderCircle className="w-5 h-5 text-primary animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (!recs || recs.length === 0) return null;

  return (
    <section className="py-4">
      <div className="container-cine">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-bold text-foreground">For You</h2>
          {topGenres.length > 0 && (
            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-sm">
              {topGenres.map((g) => g.name).join(" · ")}
            </span>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {recs.map((m) => (
            <Link
              key={m.id}
              href={`/movies/${m.id}`}
              className="flex-shrink-0 w-36 sm:w-40 group"
            >
              <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-muted border border-border group-hover:border-primary/50 transition-colors">
                {m.posterPath ? (
                  <Image
                    src={getPosterUrl(m.posterPath, "w342")}
                    alt={m.title}
                    fill
                    sizes="160px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px]">
                    {m.title.slice(0, 2)}
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-foreground line-clamp-1 mt-1.5 group-hover:text-primary transition-colors">
                {m.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {m.releaseDate && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {m.releaseDate.slice(0, 4)}
                  </span>
                )}
                {m.voteAverage > 0 && (
                  <span className="text-[10px] text-primary font-mono">
                    ★ {m.voteAverage.toFixed(1)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
