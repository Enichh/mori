"use client";

import * as React from "react";
import { MediaHero } from "@/components/media/media-hero";
import { MediaGrid } from "@/components/media/media-grid";
import { WatchHistory } from "@/components/media/watch-history";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import type { Movie, TVShow } from "@/types";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";
const ANILIST_URL = "https://graphql.anilist.co";

// ---------------------------------------------------------------------------
// Fetchers (run in browser, zero Netlify cost)
// ---------------------------------------------------------------------------

async function fetchTrendingMovies(): Promise<Movie[]> {
  const res = await fetch(
    `${TMDB_BASE}/trending/movie/day?api_key=${TMDB_KEY}`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 12).map(mapMovie);
}

async function fetchTrendingTV(): Promise<TVShow[]> {
  const res = await fetch(`${TMDB_BASE}/trending/tv/week?api_key=${TMDB_KEY}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 12).map(mapTV);
}

async function fetchPopularAnime(): Promise<TVShow[]> {
  const query = `query {
    Page(page: 1, perPage: 12) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title { english romaji native }
        coverImage { large }
        bannerImage
        format
        status
        episodes
        averageScore
        popularity
        genres
        season
        seasonYear
        description
      }
    }
  }`;
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data?.Page?.media || []).map((a: any) => ({
    id: a.id,
    mediaType: "anime" as const,
    title: a.title?.english ?? a.title?.romaji ?? a.title?.native ?? "",
    name: a.title?.english ?? a.title?.romaji ?? "",
    originalName: a.title?.native ?? "",
    overview: a.description ?? "",
    posterPath: a.coverImage?.large ?? "",
    backdropPath: a.bannerImage ?? null,
    voteAverage: a.averageScore ? a.averageScore / 10 : 0,
    voteCount: a.popularity ?? 0,
    genreIds: [],
    popularity: a.popularity ?? 0,
    originalLanguage: "ja",
    adult: false,
    firstAirDate: a.seasonYear ? `${a.seasonYear}-01-01` : "",
    lastAirDate: "",
    numberOfSeasons: 1,
    numberOfEpisodes: a.episodes ?? 0,
    status: a.status ?? "",
    seasons: [],
    credits: { cast: [], crew: [] },
    similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
    videos: { results: [] },
    nextEpisodeToAir: null,
  })) as any;
}

// ---- Mappers ----
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

function mapTV(r: any): TVShow {
  return {
    id: r.id,
    mediaType: "tv",
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
    adult: false,
    firstAirDate: r.first_air_date || "",
    lastAirDate: "",
    numberOfSeasons: 0,
    numberOfEpisodes: 0,
    status: "",
    seasons: [],
    credits: { cast: [], crew: [] },
    similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
    videos: { results: [] },
    nextEpisodeToAir: null,
  } as TVShow;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomeClient() {
  const { data: trendingMovies, loading: moviesLoading } = useCachedFetch(
    "home:trending-movies",
    fetchTrendingMovies,
    3600000, // 1 hour
  );

  const { data: trendingTV, loading: tvLoading } = useCachedFetch(
    "home:trending-tv",
    fetchTrendingTV,
    3600000,
  );

  const { data: popularAnime, loading: animeLoading } = useCachedFetch(
    "home:popular-anime",
    fetchPopularAnime,
    3600000,
  );

  const featuredMovie = trendingMovies?.[0] || null;

  const isLoading = moviesLoading || tvLoading || animeLoading;

  return (
    <div>
      {featuredMovie && <MediaHero media={featuredMovie} mediaType="movie" />}

      {!featuredMovie && (
        <section className="relative w-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card">
          <div className="container-cine text-center py-20">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Welcome to <span className="text-primary">Mori</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Stream the latest Movies, TV Shows, and Anime in stunning quality.
            </p>
            {isLoading && (
              <p className="text-xs text-muted-foreground mt-4">Loading...</p>
            )}
          </div>
        </section>
      )}

      <section className="marquee-ticker">
        <div className="marquee-ticker-content">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-7 pr-7">
              <span className="text-[11px] tracking-[0.18em] text-primary uppercase font-body">
                {i % 2 === 0 ? "Trending Now" : "New Releases"}
              </span>
              <span className="text-[rgb(61,61,61)] text-xs">✕</span>
            </span>
          ))}
        </div>
      </section>

      <WatchHistory maxItems={8} />

      <div className="container-cine space-y-12 py-10">
        {trendingMovies && trendingMovies.length > 0 && (
          <MediaGrid
            title="Trending Movies"
            items={trendingMovies}
            mediaType="movie"
            viewAllHref="/movies"
          />
        )}

        {trendingTV && trendingTV.length > 0 && (
          <MediaGrid
            title="Trending TV Shows"
            items={trendingTV}
            mediaType="tv"
            viewAllHref="/tv"
          />
        )}

        {popularAnime && popularAnime.length > 0 && (
          <MediaGrid
            title="Popular Anime"
            items={popularAnime}
            mediaType="anime"
            viewAllHref="/anime"
          />
        )}
      </div>

      <section className="py-12">
        <div className="container-cine">
          <div className="terminal-box text-center">
            <pre className="ascii-art text-primary/25 pointer-events-none">
              {`  ╔══════════════════════════════════════════════╗
  ║    ███╗   ███╗ ██████╗ ██████╗ ██╗          ║
  ║    ████╗ ████║██╔═══██╗██╔══██╗██║          ║
  ║    ██╔████╔██║██║   ██║██████╔╝██║          ║
  ║    ██║╚██╔╝██║██║   ██║██╔══██╗██║          ║
  ║    ██║ ╚═╝ ██║╚██████╔╝██║  ██║██║          ║
  ║    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝          ║
  ║  zkPass-inspired · TMDB · Vidking · Vidhide  ║
  ╚══════════════════════════════════════════════╝`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
