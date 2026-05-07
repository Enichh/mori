"use client";

import { useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Play, ChevronLeft, AlertCircle, RefreshCw } from "lucide-react";
import { MediaGrid } from "@/components/media/media-grid";
import { SeasonEpisodePicker } from "./season-episode-picker";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { getPosterUrl, getBackdropUrl, getProfileUrl } from "@/lib/tmdb-image";
import type {
  TVShow,
  Season,
  Episode,
  Credits,
  SimilarResponse,
  VideoResult,
  CastMember,
  CrewMember,
} from "@/types/media";

// ---------------------------------------------------------------------------
// TMDB API helpers (client-safe)
// ---------------------------------------------------------------------------

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const TTL_24H = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Mappers — replicate the exact shape from services/tmdb/tv.ts
// ---------------------------------------------------------------------------

function mapEpisode(e: {
  id: number;
  name: string;
  overview?: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
}): Episode {
  return {
    id: e.id,
    name: e.name,
    overview: e.overview ?? "",
    episodeNumber: e.episode_number,
    seasonNumber: e.season_number,
    stillPath: e.still_path,
    airDate: e.air_date,
    runtime: e.runtime,
    voteAverage: e.vote_average,
    voteCount: e.vote_count,
  };
}

function mapSeason(s: {
  id: number;
  name: string;
  overview?: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
  episodes?: { id: number; name: string; overview?: string; episode_number: number; season_number: number; still_path: string | null; air_date: string | null; runtime: number | null; vote_average: number; vote_count: number }[];
}): Season {
  return {
    id: s.id,
    name: s.name,
    overview: s.overview ?? "",
    seasonNumber: s.season_number,
    episodeCount: s.episode_count,
    posterPath: s.poster_path,
    airDate: s.air_date,
    episodes: s.episodes?.map(mapEpisode),
  };
}

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

function mapSimilarTV(s: {
  page?: number;
  results?: { id: number; name: string; original_name?: string; overview?: string; poster_path: string | null; backdrop_path: string | null; vote_average?: number; vote_count?: number; genre_ids?: number[]; popularity?: number; original_language?: string; adult?: boolean; first_air_date?: string }[];
  total_pages?: number;
  total_results?: number;
}): SimilarResponse {
  return {
    page: s.page ?? 1,
    results: (s.results ?? []).map((r) => ({
      id: r.id,
      title: r.name,
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

function mapTVDetail(d: Record<string, unknown>): TVShow {
  const genresArr = (d.genres as { id: number; name: string }[]) ?? [];
  const seasonsArr = (d.seasons as Parameters<typeof mapSeason>[0][]) ?? [];
  return {
    id: d.id as number,
    mediaType: "tv",
    title: (d.name as string) ?? "",
    name: (d.name as string) ?? "",
    originalName: (d.original_name as string) ?? "",
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
    firstAirDate: (d.first_air_date as string) ?? "",
    lastAirDate: (d.last_air_date as string) ?? "",
    numberOfSeasons: (d.number_of_seasons as number) ?? 0,
    numberOfEpisodes: (d.number_of_episodes as number) ?? 0,
    status: (d.status as string) ?? "",
    tagline: (d.tagline as string) ?? null,
    seasons: seasonsArr.map(mapSeason),
    credits: mapCredits(d.credits as Parameters<typeof mapCredits>[0]),
    similar: mapSimilarTV(d.similar as Parameters<typeof mapSimilarTV>[0]),
    videos: mapVideos(d.videos as Parameters<typeof mapVideos>[0]),
    nextEpisodeToAir: d.next_episode_to_air
      ? mapEpisode(d.next_episode_to_air as Parameters<typeof mapEpisode>[0])
      : null,
    imdbId: (d.imdb_id as string) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TVSkeleton() {
  return (
    <div className="animate-pulse">
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
              <div className="flex gap-3">
                <div className="h-11 w-36 bg-white/10 rounded" />
                <div className="h-11 w-36 bg-white/10 rounded" />
              </div>
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
  showId: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TVDetailClient({ showId }: Props) {
  // ---- Fetch show details -----------------------------------------------
  const showFetcher = useCallback(async (): Promise<TVShow> => {
    const res = await fetch(
      `${BASE}/tv/${showId}?api_key=${API_KEY}&append_to_response=credits,similar,videos,external_ids`,
    );
    if (!res.ok) {
      if (res.status === 404) throw new Error("NOT_FOUND");
      throw new Error(`TMDB ${res.status}: Failed to fetch TV details`);
    }
    const json: Record<string, unknown> = await res.json();
    return mapTVDetail(json);
  }, [showId]);

  const {
    data: show,
    loading: showLoading,
    error: showError,
    refetch: refetchShow,
  } = useCachedFetch<TVShow>(`tv:detail:${showId}`, showFetcher, TTL_24H);

  // ---- Fetch first season with episodes ---------------------------------
  // Determine the first season number from the show data (if loaded)
  const firstSeasonNum = useMemo(() => {
    if (!show) return null;
    const first = show.seasons?.find((s) => s.seasonNumber > 0);
    return first?.seasonNumber ?? null;
  }, [show]);

  const seasonFetcher = useCallback(async (): Promise<Season | null> => {
    if (!firstSeasonNum) return null;
    const res = await fetch(
      `${BASE}/tv/${showId}/season/${firstSeasonNum}?api_key=${API_KEY}`,
    );
    if (!res.ok) return null;
    const json: Record<string, unknown> = await res.json();
    return mapSeason(json as Parameters<typeof mapSeason>[0]);
  }, [showId, firstSeasonNum]);

  const {
    data: firstSeasonData,
    loading: seasonLoading,
  } = useCachedFetch<Season | null>(
    `tv:season:${showId}:${firstSeasonNum ?? 0}`,
    seasonFetcher,
    TTL_24H,
  );

  // ---- Derived data -----------------------------------------------------
  const backdropUrl = useMemo(
    () => getBackdropUrl(show?.backdropPath ?? null, "w1280"),
    [show?.backdropPath],
  );
  const posterUrl = useMemo(
    () => getPosterUrl(show?.posterPath ?? null, "w500"),
    [show?.posterPath],
  );
  const cast = useMemo(
    () => show?.credits?.cast?.slice(0, 20) ?? [],
    [show?.credits?.cast],
  );
  const similarShows = useMemo(
    () => show?.similar?.results?.slice(0, 12) ?? [],
    [show?.similar?.results],
  );

  // Merge season 1 episodes into the seasons array
  const enhancedSeasons = useMemo((): Season[] => {
    if (!show) return [];
    const seasons = show.seasons?.filter((s) => s.seasonNumber > 0) ?? [];
    if (firstSeasonData) {
      return seasons.map((s) =>
        s.seasonNumber === firstSeasonData.seasonNumber ? firstSeasonData : s,
      );
    }
    return seasons;
  }, [show, firstSeasonData]);

  const firstSeason = enhancedSeasons[0];
  const lastSeason = enhancedSeasons[enhancedSeasons.length - 1];

  // ---- States -----------------------------------------------------------

  const loading = showLoading || (show !== null && firstSeasonNum !== null && seasonLoading && !firstSeasonData);

  if (showLoading) return <TVSkeleton />;

  if (showError) {
    const isNotFound = showError === "NOT_FOUND";
    return (
      <div className="container-cine py-20 text-center">
        {isNotFound ? (
          <>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
              TV Show Not Found
            </h1>
            <Link
              href="/tv"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to TV Shows
            </Link>
          </>
        ) : (
          <>
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              Failed to Load
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
              {showError}
            </p>
            <button
              onClick={() => refetchShow()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </>
        )}
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          TV Show Not Found
        </h1>
        <Link
          href="/tv"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to TV Shows
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
              alt={show.name}
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
            href="/tv"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to TV Shows
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="hidden md:block relative w-48 lg:w-56 aspect-[2/3] rounded-lg overflow-hidden border border-border flex-shrink-0 shadow-2xl">
              <Image
                src={posterUrl}
                alt={show.name}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-display-sm font-heading font-bold text-foreground mb-3 break-words">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="text-sm text-primary/80 italic mb-4">
                  {show.tagline}
                </p>
              )}

              <div className="inline-flex flex-wrap items-center gap-4 mb-4 text-sm bg-black/40 backdrop-blur-sm rounded-sm px-4 py-2 border border-white/10">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-white font-semibold">
                    {show.voteAverage?.toFixed(1)}
                  </span>
                  <span className="text-white/50">
                    ({show.voteCount?.toLocaleString()})
                  </span>
                </div>
                {show.firstAirDate && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span>
                      {new Date(show.firstAirDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <span className="text-white/80">
                  {show.numberOfSeasons} season
                  {show.numberOfSeasons !== 1 ? "s" : ""}
                </span>
                <span className="text-white/80">
                  {show.numberOfEpisodes} episode
                  {show.numberOfEpisodes !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {(show.genres ?? []).map((g) => (
                  <Link
                    key={g.id}
                    href={`/tv?genre=${g.id}`}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>

              {show.overview && (
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 mb-6 max-w-2xl">
                  <p className="text-sm md:text-base text-white/85 leading-relaxed break-words">
                    {show.overview}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {firstSeason && (
                  <Link
                    href={`/watch/tv/${showId}/${firstSeason.seasonNumber}/1`}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    <Play className="w-5 h-5 fill-current" /> Watch S
                    {firstSeason.seasonNumber} E1
                  </Link>
                )}
                {lastSeason &&
                  lastSeason.seasonNumber !== firstSeason?.seasonNumber && (
                    <Link
                      href={`/watch/tv/${showId}/${lastSeason.seasonNumber}/1`}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors border border-white/20"
                    >
                      <Play className="w-5 h-5 fill-current" /> Watch Latest — S
                      {lastSeason.seasonNumber} E1
                    </Link>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes */}
      {enhancedSeasons.length > 0 && (
        <SeasonEpisodePicker
          seasons={enhancedSeasons}
          showId={showId}
          showName={show.name}
        />
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {cast.map((m) => (
                <div key={m.id} className="flex-shrink-0 w-28 text-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-card border border-border mb-2 mx-auto">
                    <Image
                      src={getProfileUrl(m.profilePath, "w185")}
                      alt={m.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {m.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {m.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Similar */}
      {similarShows.length > 0 && (
        <MediaGrid
          title="Similar TV Shows"
          items={similarShows}
          mediaType="tv"
        />
      )}
    </div>
  );
}
