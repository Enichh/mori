"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { MediaGrid } from "@/components/media/media-grid";
import { getProfileUrl } from "@/lib/tmdb-image";
import {
  Star,
  Calendar,
  Play,
  ChevronLeft,
  Clock,
  Tv,
  RefreshCw,
} from "lucide-react";
import type { BaseMedia } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANILIST_API = "/api/anilist";
const DETAIL_TTL = 86400000; // 24 hours

// ---------------------------------------------------------------------------
// GraphQL query
// ---------------------------------------------------------------------------

const DETAIL_QUERY = `query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    description(asHtml: false)
    coverImage { large medium }
    bannerImage
    format
    status
    episodes
    season
    seasonYear
    averageScore
    popularity
    genres
    studios { nodes { name } }
    characters(sort: ROLE, perPage: 20) {
      edges {
        role
        node {
          id
          name { full native userPreferred }
          image { large medium }
        }
        voiceActors(language: JAPANESE) {
          id
          name { full native userPreferred }
          image { large medium }
          language: languageV2
        }
      }
    }
    recommendations(sort: RATING_DESC, perPage: 12) {
      edges {
        node {
          rating
          mediaRecommendation {
            id
            title { english romaji native }
            coverImage { large }
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
      }
    }
  }
}`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MappedAnime {
  id: number;
  title: string;
  nativeTitle: string;
  description: string;
  coverImage: string;
  bannerImage: string | null;
  format: string;
  status: string;
  episodes: number | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number;
  genres: string[];
  studios: string[];
  characters: MappedCharacter[];
  recommendations: MappedRecommendation[];
}

interface MappedCharacter {
  id: number;
  name: string;
  image: string;
  role: string;
  voiceActors: { id: number; name: string; image: string; language: string }[];
}

interface MappedRecommendation {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  format: string;
  status: string;
  episodes: number | null;
  averageScore: number | null;
  popularity: number;
  genres: string[];
  season: string | null;
  seasonYear: number | null;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function mapAnime(raw: any): MappedAnime {
  return {
    id: raw.id,
    title: raw.title?.english ?? raw.title?.romaji ?? raw.title?.native ?? "",
    nativeTitle: raw.title?.native ?? "",
    description: raw.description ?? "",
    coverImage: raw.coverImage?.large ?? raw.coverImage?.medium ?? "",
    bannerImage: raw.bannerImage ?? null,
    format: raw.format ?? "TV",
    status: raw.status ?? "NOT_YET_RELEASED",
    episodes: raw.episodes ?? null,
    season: raw.season ?? null,
    seasonYear: raw.seasonYear ?? null,
    averageScore: raw.averageScore ?? null,
    popularity: raw.popularity ?? 0,
    genres: raw.genres ?? [],
    studios: raw.studios?.nodes?.map((s: any) => s.name) ?? [],
    characters:
      raw.characters?.edges?.slice(0, 20).map((e: any) => ({
        id: e.node.id,
        name: e.node.name?.userPreferred ?? e.node.name?.full ?? "",
        image: e.node.image?.large ?? e.node.image?.medium ?? "",
        role: e.role ?? "SUPPORTING",
        voiceActors:
          e.voiceActors?.slice(0, 2).map((va: any) => ({
            id: va.id,
            name: va.name?.userPreferred ?? va.name?.full ?? "",
            image: va.image?.large ?? va.image?.medium ?? "",
            language: va.language ?? "Japanese",
          })) ?? [],
      })) ?? [],
    recommendations:
      raw.recommendations?.edges?.slice(0, 12).map((e: any) => ({
        id: e.node.mediaRecommendation.id,
        title:
          e.node.mediaRecommendation.title?.english ??
          e.node.mediaRecommendation.title?.romaji ??
          e.node.mediaRecommendation.title?.native ??
          "",
        description: e.node.mediaRecommendation.description ?? "",
        coverImage: e.node.mediaRecommendation.coverImage?.large ?? "",
        format: e.node.mediaRecommendation.format ?? "TV",
        status: e.node.mediaRecommendation.status ?? "NOT_YET_RELEASED",
        episodes: e.node.mediaRecommendation.episodes ?? null,
        averageScore: e.node.mediaRecommendation.averageScore ?? null,
        popularity: e.node.mediaRecommendation.popularity ?? 0,
        genres: e.node.mediaRecommendation.genres ?? [],
        season: e.node.mediaRecommendation.season ?? null,
        seasonYear: e.node.mediaRecommendation.seasonYear ?? null,
      })) ?? [],
  };
}

async function fetchAnimeDetail(anilistId: number): Promise<MappedAnime> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      query: DETAIL_QUERY,
      variables: { id: anilistId },
    }),
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

  return mapAnime(json.data.Media);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatStatus(status: string): string {
  switch (status) {
    case "RELEASING":
      return "Airing";
    case "FINISHED":
      return "Finished";
    case "NOT_YET_RELEASED":
      return "Upcoming";
    case "CANCELLED":
      return "Cancelled";
    case "HIATUS":
      return "Hiatus";
    default:
      return status.replace(/_/g, " ");
  }
}

function mapRecommendationsToBaseMedia(
  recs: MappedRecommendation[],
): BaseMedia[] {
  return recs.map((r) => ({
    id: r.id,
    title: r.title,
    overview: r.description,
    posterPath: r.coverImage,
    backdropPath: null,
    voteAverage: r.averageScore ? r.averageScore / 10 : 0,
    voteCount: r.popularity,
    genreIds: [],
    popularity: r.popularity,
    originalLanguage: "ja",
    adult: false,
    mediaType: "anime" as const,
  }));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Skeleton() {
  return (
    <div className="animate-pulse">
      {/* Banner skeleton */}
      <section className="relative w-full min-h-[50vh] md:min-h-[65vh] flex items-end pb-10 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
        <div className="container-cine relative z-10 w-full">
          <div className="h-4 w-24 bg-muted rounded mb-6" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="hidden md:block w-48 lg:w-56 aspect-[2/3] rounded-lg bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-64 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="flex gap-4">
                <div className="h-8 w-20 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-8 w-24 bg-muted rounded" />
              </div>
              <div className="h-20 bg-muted rounded max-w-2xl" />
              <div className="h-12 w-36 bg-muted rounded" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AnimeDetailClientProps {
  anilistId: number;
}

export function AnimeDetailClient({ anilistId }: AnimeDetailClientProps) {
  const {
    data: anime,
    loading,
    error,
    refetch,
  } = useCachedFetch<MappedAnime>(
    `anime:detail:${anilistId}`,
    () => fetchAnimeDetail(anilistId),
    DETAIL_TTL,
  );

  // ---- Loading ----
  if (loading) return <Skeleton />;

  // ---- Error ----
  if (error) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Failed to Load Anime
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
  if (!anime) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Anime Not Found
        </h1>
        <Link
          href="/anime"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Anime
        </Link>
      </div>
    );
  }

  // ---- Derived ----
  const similarItems = mapRecommendationsToBaseMedia(anime.recommendations);

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative w-full min-h-[50vh] md:min-h-[65vh] flex items-end pb-10 md:pb-16 overflow-hidden">
        {anime.bannerImage && (
          <>
            <Image
              src={anime.bannerImage}
              alt={anime.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 gradient-overlay-full" />
          </>
        )}
        {!anime.bannerImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
        )}

        <div className="container-cine relative z-10">
          <Link
            href="/anime"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Anime
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover image (hidden on mobile) */}
            <div className="hidden md:block relative w-48 lg:w-56 aspect-[2/3] rounded-lg overflow-hidden border border-border flex-shrink-0 shadow-2xl">
              <Image
                src={anime.coverImage}
                alt={anime.title}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-display-sm font-heading font-bold text-foreground mb-2 break-words">
                {anime.title}
              </h1>
              {anime.nativeTitle && anime.nativeTitle !== anime.title && (
                <p className="text-sm text-muted-foreground mb-3">
                  {anime.nativeTitle}
                </p>
              )}

              {/* Meta bar */}
              <div className="inline-flex flex-wrap items-center gap-4 mb-4 text-sm bg-black/40 backdrop-blur-sm rounded-sm px-4 py-2 border border-white/10">
                {anime.averageScore != null && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-white font-semibold">
                      {anime.averageScore / 10}%
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-white/90">
                  <Tv className="w-4 h-4 text-white/60" />
                  <span>{anime.format}</span>
                </div>
                {anime.episodes != null && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Clock className="w-4 h-4 text-white/60" />
                    <span>{anime.episodes} eps</span>
                  </div>
                )}
                {anime.season && anime.seasonYear && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span>
                      {anime.season} {anime.seasonYear}
                    </span>
                  </div>
                )}
                <span
                  className={`px-2 py-0.5 text-xs rounded-sm font-medium ${
                    anime.status === "RELEASING"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {formatStatus(anime.status)}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres.map((g: string) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20"
                  >
                    {g}
                  </span>
                ))}
                <span className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20">
                  🇯🇵 Japanese
                </span>
                {anime.studios.map((s: string) => (
                  <span
                    key={s}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-muted text-muted-foreground border border-border"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Description */}
              {anime.description && (
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 mb-6 max-w-2xl">
                  <p
                    className="text-sm md:text-base text-white/85 leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ __html: anime.description }}
                  />
                </div>
              )}

              {/* Watch Now CTA */}
              <Link
                href={`/watch/anime/${anilistId}/1`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Play className="w-5 h-5 fill-current" /> Watch Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Episodes Grid ── */}
      {anime.episodes != null && anime.episodes > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Episodes
            </h2>
            <p className="text-xs text-muted-foreground font-mono mb-4">
              {anime.episodes} episodes
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: anime.episodes }, (_, i) => i + 1).map(
                (epNum) => (
                  <Link
                    key={epNum}
                    href={`/watch/anime/${anilistId}/${epNum}`}
                    className="flex flex-col rounded-sm bg-card border border-border hover:border-primary/30 hover:bg-card-hover transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted overflow-hidden rounded-t-sm">
                      {anime.coverImage ? (
                        <Image
                          src={anime.coverImage}
                          alt={`Episode ${epNum}`}
                          fill
                          sizes="200px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-muted-foreground/25 font-mono">
                            {epNum}
                          </span>
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Play
                          className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="white"
                        />
                      </div>
                    </div>
                    {/* Episode label */}
                    <div className="p-2.5">
                      <span className="text-xs text-primary font-mono">
                        E{epNum.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── No episodes (ongoing / unknown) ── */}
      {(anime.episodes == null || anime.episodes === 0) && (
        <section className="py-10">
          <div className="container-cine text-center">
            <p className="text-sm text-muted-foreground">
              {anime.status === "RELEASING"
                ? "This anime is currently airing. Episodes will be available as they release."
                : "Episode count not available."}
            </p>
          </div>
        </section>
      )}

      {/* ── Characters ── */}
      {anime.characters.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Characters
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {anime.characters.map((c) => (
                <div key={c.id} className="flex-shrink-0 w-32 text-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-card border border-border mb-2 mx-auto">
                    <Image
                      src={getProfileUrl(c.image)}
                      alt={c.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {c.role}
                  </p>
                  {c.voiceActors?.[0] && (
                    <p className="text-[9px] text-primary/70 line-clamp-1 mt-0.5">
                      VA: {c.voiceActors[0].name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Similar Anime ── */}
      {similarItems.length > 0 && (
        <MediaGrid
          title="Similar Anime"
          items={similarItems}
          mediaType="anime"
        />
      )}
    </div>
  );
}
