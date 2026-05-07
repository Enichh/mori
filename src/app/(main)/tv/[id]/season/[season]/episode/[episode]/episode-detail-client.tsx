"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { getStillUrl } from "@/lib/tmdb-image";
import { Star, ChevronLeft, ChevronRight, Play, RefreshCw } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";
const DETAIL_TTL = 86400000; // 24 hours

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EpisodeData {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
}

interface SeasonEpisode {
  id: number;
  name: string;
  episode_number: number;
  still_path: string | null;
  runtime: number | null;
  vote_average: number;
}

interface SeasonData {
  id: number;
  name: string;
  season_number: number;
  episodes: SeasonEpisode[];
}

interface ShowData {
  id: number;
  name: string;
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchEpisodeData(
  showId: number,
  seasonNum: number,
  episodeNum: number,
): Promise<{
  show: ShowData;
  episode: EpisodeData;
  season: SeasonData;
}> {
  const url = (path: string) => `${TMDB_BASE}${path}?api_key=${TMDB_KEY}`;

  const [showRes, episodeRes, seasonRes] = await Promise.all([
    fetch(url(`/tv/${showId}`)),
    fetch(url(`/tv/${showId}/season/${seasonNum}/episode/${episodeNum}`)),
    fetch(url(`/tv/${showId}/season/${seasonNum}`)),
  ]);

  if (!showRes.ok || !episodeRes.ok || !seasonRes.ok) {
    const parts: string[] = [];
    if (!showRes.ok) parts.push(`show: ${showRes.status}`);
    if (!episodeRes.ok) parts.push(`episode: ${episodeRes.status}`);
    if (!seasonRes.ok) parts.push(`season: ${seasonRes.status}`);
    throw new Error(`TMDB errors: ${parts.join(", ")}`);
  }

  const [show, episode, season] = await Promise.all([
    showRes.json() as Promise<ShowData>,
    episodeRes.json() as Promise<EpisodeData>,
    seasonRes.json() as Promise<SeasonData>,
  ]);

  return { show, episode, season };
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function Skeleton() {
  return (
    <div className="container-cine py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Still image skeleton */}
          <div className="aspect-video rounded-lg bg-muted" />
          {/* Title skeleton */}
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="flex gap-3">
            <div className="h-6 w-16 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded" />
          </div>
          {/* Overview skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
          <div className="h-12 w-44 bg-muted rounded" />
        </div>
        {/* Sidebar skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-16 aspect-video rounded bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface EpisodeDetailClientProps {
  showId: number;
  seasonNum: number;
  episodeNum: number;
}

export function EpisodeDetailClient({
  showId,
  seasonNum,
  episodeNum,
}: EpisodeDetailClientProps) {
  const cacheKey = `tv:episode:${showId}:s${seasonNum}:e${episodeNum}`;

  const { data, loading, error, refetch } = useCachedFetch(
    cacheKey,
    () => fetchEpisodeData(showId, seasonNum, episodeNum),
    DETAIL_TTL,
  );

  // ---- Loading ----
  if (loading) return <Skeleton />;

  // ---- Error ----
  if (error) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Failed to Load Episode
        </h1>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  // ---- Not Found ----
  if (!data || !data.show || !data.episode) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Episode Not Found
        </h1>
        <Link
          href={`/tv/${showId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Show
        </Link>
      </div>
    );
  }

  // ---- Derived ----
  const { show, episode, season } = data;
  const episodes: SeasonEpisode[] = season?.episodes || [];

  const prevEpisode =
    episodes.find((e: SeasonEpisode) => e.episode_number === episodeNum - 1) ||
    null;
  const nextEpisode =
    episodes.find((e: SeasonEpisode) => e.episode_number === episodeNum + 1) ||
    null;

  const formattedAirDate = episode.air_date
    ? new Date(episode.air_date).toLocaleDateString()
    : null;

  return (
    <div className="container-cine py-8">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          href={`/tv/${showId}`}
          className="hover:text-foreground transition-colors"
        >
          {show.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          href={`/tv/${showId}/season/${seasonNum}/episode/1`}
          className="hover:text-foreground transition-colors"
        >
          Season {seasonNum}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">Episode {episodeNum}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2">
          {/* Still image */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-card border border-border mb-6">
            {episode.still_path ? (
              <Image
                src={getStillUrl(episode.still_path, "w780")}
                alt={episode.name}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No preview available</p>
              </div>
            )}
          </div>

          {/* Episode title */}
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            {episode.name}
          </h1>

          {/* Meta line: S•E • air date */}
          <p className="text-sm text-primary font-mono mb-4">
            S{seasonNum} • E{episodeNum}
            {formattedAirDate && ` • ${formattedAirDate}`}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm text-foreground font-semibold">
                {episode.vote_average != null
                  ? episode.vote_average.toFixed(1)
                  : "N/A"}
              </span>
            </div>
            {episode.runtime != null && episode.runtime > 0 && (
              <span className="text-sm text-muted-foreground">
                {episode.runtime} min
              </span>
            )}
          </div>

          {/* Overview */}
          {episode.overview && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
              {episode.overview}
            </p>
          )}

          {/* Watch CTA */}
          <Link
            href={`/watch/tv/${showId}/${seasonNum}/${episodeNum}`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Play className="w-5 h-5 fill-current" /> Watch This Episode
          </Link>

          {/* ── Previous / Next Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {prevEpisode ? (
              <Link
                href={`/tv/${showId}/season/${seasonNum}/episode/${prevEpisode.episode_number}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <div>
                  <span className="text-xs text-muted-foreground">
                    Previous
                  </span>
                  <p className="font-medium text-foreground line-clamp-1">
                    {prevEpisode.name}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextEpisode && (
              <Link
                href={`/tv/${showId}/season/${seasonNum}/episode/${nextEpisode.episode_number}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-right"
              >
                <div>
                  <span className="text-xs text-muted-foreground">Next</span>
                  <p className="font-medium text-foreground line-clamp-1">
                    {nextEpisode.name}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* ── Sidebar: Episode List ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">
              Episodes — S{seasonNum}
            </h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {episodes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No episodes found.
                </p>
              ) : (
                episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/tv/${showId}/season/${seasonNum}/episode/${ep.episode_number}`}
                    className={`flex gap-3 p-3 rounded-md transition-colors ${
                      ep.episode_number === episodeNum
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-card border border-transparent"
                    }`}
                  >
                    <div className="relative w-16 aspect-video rounded overflow-hidden flex-shrink-0 bg-muted">
                      {ep.still_path && (
                        <Image
                          src={getStillUrl(ep.still_path, "w185")}
                          alt={ep.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1">
                        {ep.episode_number}. {ep.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ep.runtime != null ? `${ep.runtime}m` : ""}
                        {ep.vote_average != null
                          ? ` · ${ep.vote_average.toFixed(1)}★`
                          : ""}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
