"use client";

import { useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar, Play, ChevronLeft, AlertCircle, RefreshCw } from "lucide-react";
import { MediaGrid } from "@/components/media/media-grid";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { getPosterUrl, getBackdropUrl, getProfileUrl } from "@/lib/tmdb-image";
import type { Movie, Credits, SimilarResponse, VideoResult, CastMember, CrewMember } from "@/types/media";

// ---------------------------------------------------------------------------
// TMDB API helpers (client-safe)
// ---------------------------------------------------------------------------

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const TTL_24H = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Mappers — replicate the exact shape from services/tmdb/movies.ts
// ---------------------------------------------------------------------------

function mapCredits(c: {
  cast?: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
  crew?: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
}): Credits {
  return {
    cast: (c.cast ?? []).map(
      (m): CastMember => ({
        id: m.id,
        name: m.name,
        character: m.character,
        profilePath: m.profile_path,
        order: m.order,
      }),
    ),
    crew: (c.crew ?? []).map(
      (m): CrewMember => ({
        id: m.id,
        name: m.name,
        job: m.job,
        department: m.department,
        profilePath: m.profile_path,
      }),
    ),
  };
}

function mapSimilarMovies(s: {
  page?: number;
  results?: { id: number; title: string; original_title?: string; overview?: string; poster_path: string | null; backdrop_path: string | null; vote_average?: number; vote_count?: number; genre_ids?: number[]; popularity?: number; original_language?: string; adult?: boolean; release_date?: string }[];
  total_pages?: number;
  total_results?: number;
}): SimilarResponse {
  return {
    page: s.page ?? 1,
    results: (s.results ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      overview: r.overview ?? "",
      posterPath: r.poster_path,
      backdropPath: r.backdrop_path,
      voteAverage: r.vote_average ?? 0,
      voteCount: r.vote_count ?? 0,
      genreIds: r.genre_ids ?? [],
      popularity: r.popularity ?? 0,
      originalLanguage: r.original_language ?? "",
      adult: r.adult ?? false,
    })),
    totalPages: s.total_pages ?? 1,
    totalResults: s.total_results ?? 0,
  };
}

function mapVideos(v: {
  results?: { id: string; key: string; name: string; site: string; type: string; official: boolean }[];
}): VideoResult {
  return { results: v.results ?? [] };
}

function mapMovieDetail(d: Record<string, unknown>): Movie {
  const genresArr = (d.genres as { id: number; name: string }[]) ?? [];
  return {
    id: d.id as number,
    mediaType: "movie",
    title: d.title as string,
    originalTitle: (d.original_title as string) ?? "",
    overview: (d.overview as string) ?? "",
    posterPath: (d.poster_path as string) ?? null,
    backdropPath: (d.backdrop_path as string) ?? null,
    voteAverage: (d.vote_average as number) ?? 0,
    voteCount: (d.vote_count as number) ?? 0,
    genreIds: genresArr.map((g) => g.id),
    genres: genresArr,
    popularity: (d.popularity as number) ?? 0,
    originalLanguage: (d.original_language as string) ?? "",
    adult: (d.adult as boolean) ?? false,
    releaseDate: (d.release_date as string) ?? "",
    runtime: (d.runtime as number) ?? null,
    budget: (d.budget as number) ?? 0,
    revenue: (d.revenue as number) ?? 0,
    status: (d.status as string) ?? "",
    tagline: (d.tagline as string) ?? null,
    imdbId: (d.imdb_id as string) ?? null,
    credits: mapCredits(d.credits as Parameters<typeof mapCredits>[0]),
    similar: mapSimilarMovies(d.similar as Parameters<typeof mapSimilarMovies>[0]),
    videos: mapVideos(d.videos as Parameters<typeof mapVideos>[0]),
  };
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function MovieSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <section className="relative w-full min-h-[50vh] md:min-h-[65vh] flex items-end pb-10 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
        <div className="container-cine relative z-10">
          <div className="h-4 w-28 bg-white/10 rounded mb-6" />

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="hidden md:block w-48 lg:w-56 aspect-[2/3] rounded-lg bg-white/10 flex-shrink-0" />

            <div className="flex-1 min-w-0 space-y-4">
              <div className="h-9 w-80 bg-white/10 rounded" />
              <div className="h-4 w-48 bg-white/10 rounded" />
              <div className="h-8 w-96 bg-white/10 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full max-w-2xl bg-white/10 rounded" />
                <div className="h-4 w-full max-w-xl bg-white/10 rounded" />
                <div className="h-4 w-3/4 max-w-lg bg-white/10 rounded" />
              </div>
              <div className="h-11 w-36 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  movieId: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MovieDetailClient({ movieId }: Props) {
  const fetcher = useCallback(async (): Promise<Movie> => {
    const res = await fetch(
      `${BASE}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,similar,videos,external_ids`,
    );
    if (!res.ok) {
      if (res.status === 404) throw new Error("NOT_FOUND");
      throw new Error(`TMDB ${res.status}: Failed to fetch movie details`);
    }
    const json: Record<string, unknown> = await res.json();
    return mapMovieDetail(json);
  }, [movieId]);

  const { data: movie, loading, error, refetch } = useCachedFetch<Movie>(
    `movie:detail:${movieId}`,
    fetcher,
    TTL_24H,
  );

  // ---- Derived data ----------------------------------------------------
  const backdropUrl = useMemo(
    () => getBackdropUrl(movie?.backdropPath ?? null, "w1280"),
    [movie?.backdropPath],
  );
  const posterUrl = useMemo(
    () => getPosterUrl(movie?.posterPath ?? null, "w500"),
    [movie?.posterPath],
  );
  const directors = useMemo(
    () =>
      movie?.credits?.crew
        ?.filter((c) => c.job === "Director")
        .map((c) => c.name) ?? [],
    [movie?.credits?.crew],
  );
  const cast = useMemo(
    () => movie?.credits?.cast?.slice(0, 20) ?? [],
    [movie?.credits?.cast],
  );
  const similarMovies = useMemo(
    () => movie?.similar?.results?.slice(0, 12) ?? [],
    [movie?.similar?.results],
  );

  // ---- States -----------------------------------------------------------
  if (loading) return <MovieSkeleton />;

  if (error) {
    const isNotFound = error === "NOT_FOUND";
    return (
      <div className="container-cine py-20 text-center">
        {isNotFound ? (
          <>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
              Movie Not Found
            </h1>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Movies
            </Link>
          </>
        ) : (
          <>
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              Failed to Load
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
              {error}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </>
        )}
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Movie Not Found
        </h1>
        <Link
          href="/movies"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Movies
        </Link>
      </div>
    );
  }

  // ---- Render -----------------------------------------------------------
  return (
    <div>
      {/* Hero */}
      <section className="relative w-full min-h-[50vh] md:min-h-[65vh] flex items-end pb-10 md:pb-16 overflow-hidden">
        {backdropUrl && !backdropUrl.startsWith("data:") && (
          <>
            <Image
              src={backdropUrl}
              alt={movie.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 gradient-overlay-full" />
          </>
        )}
        {(!backdropUrl || backdropUrl.startsWith("data:")) && (
          <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
        )}

        <div className="container-cine relative z-10">
          <Link
            href="/movies"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="hidden md:block relative w-48 lg:w-56 aspect-[2/3] rounded-lg overflow-hidden border border-border flex-shrink-0 shadow-2xl">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-display-sm font-heading font-bold text-foreground mb-3 break-words">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-sm text-primary/80 italic mb-4">
                  {movie.tagline}
                </p>
              )}

              <div className="inline-flex flex-wrap items-center gap-4 mb-4 text-sm bg-black/40 backdrop-blur-sm rounded-sm px-4 py-2 border border-white/10">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-white font-semibold">
                    {movie.voteAverage?.toFixed(1)}
                  </span>
                  <span className="text-white/50">
                    ({movie.voteCount?.toLocaleString()})
                  </span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Clock className="w-4 h-4 text-white/60" />
                    <span>
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </span>
                  </div>
                )}
                {movie.releaseDate && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span>
                      {new Date(movie.releaseDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {(movie.genres ?? []).map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/movies?genre=${genre.id}`}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {movie.overview && (
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 mb-6 max-w-2xl">
                  <p className="text-sm md:text-base text-white/85 leading-relaxed break-words">
                    {movie.overview}
                  </p>
                </div>
              )}

              {directors.length > 0 && (
                <p className="text-sm text-muted-foreground mb-6">
                  <span className="text-foreground font-medium">
                    Director{directors.length > 1 ? "s" : ""}:{" "}
                  </span>
                  {directors.join(", ")}
                </p>
              )}

              <Link
                href={`/watch/movie/${movieId}`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Play className="w-5 h-5 fill-current" /> Watch Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cast */}
      {cast.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {cast.map((member) => (
                <div key={member.id} className="flex-shrink-0 w-28 text-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-card border border-border mb-2 mx-auto">
                    <Image
                      src={getProfileUrl(member.profilePath, "w185")}
                      alt={member.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {member.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Similar */}
      {similarMovies.length > 0 && (
        <MediaGrid
          title="Similar Movies"
          items={similarMovies}
          mediaType="movie"
        />
      )}
    </div>
  );
}
