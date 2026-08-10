"use client";

import * as React from "react";
import { MediaHero } from "@/components/media/media-hero";
import { MediaGrid } from "@/components/media/media-grid";
import { WatchHistory } from "@/components/media/watch-history";
import { Recommendations } from "@/components/media/recommendations";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import type { Movie, TVShow } from "@/types";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";
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

  const featuredMovie = trendingMovies?.[0] || null;

  const isLoading = moviesLoading || tvLoading;

  return (
    <div>
      {featuredMovie && <MediaHero media={featuredMovie} mediaType="movie" />}

      {!featuredMovie && (
        <section className="relative w-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card pt-16">
          <div className="container-cine text-center py-20">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Welcome to <span className="text-primary">Mori</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Stream the latest Movies and TV Shows in stunning quality.
            </p>
            {isLoading && (
              <p className="text-xs text-muted-foreground mt-4">Loading...</p>
            )}
          </div>
        </section>
      )}

      <WatchHistory maxItems={8} />

      <Recommendations />

      <div className="container-cine space-y-8 py-6">
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
      </div>
    </div>
  );
}
