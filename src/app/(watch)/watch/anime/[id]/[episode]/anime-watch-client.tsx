"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { AnimeWatchPlayer } from "./anime-watch-player";
import {
  Star,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANILIST_API = "/api/anilist";
const DETAIL_TTL = 86400000; // 24 hours

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnimeDetail {
  id: number;
  title: string;
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
  characters: any[];
  recommendations: any[];
}

// ---------------------------------------------------------------------------
// GraphQL detail query
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
          }
        }
      }
    }
  }
}`;

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function mapDetail(raw: any): AnimeDetail {
  return {
    id: raw.id,
    title: raw.title?.english ?? raw.title?.romaji ?? raw.title?.native ?? "",
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
          "",
        coverImage: e.node.mediaRecommendation.coverImage?.large ?? "",
        rating: e.node.rating ?? 0,
      })) ?? [],
  };
}

async function fetchAnimeDetail(anilistId: number): Promise<AnimeDetail> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: DETAIL_QUERY, variables: { id: anilistId } }),
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

  return mapDetail((json.data as { Media: any }).Media);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AnimeWatchClientProps {
  anilistId: number;
  episode: number;
}

export function AnimeWatchClient({
  anilistId,
  episode: episodeNum,
}: AnimeWatchClientProps) {
  const {
    data: anime,
    loading,
    error,
  } = useCachedFetch<AnimeDetail>(
    `anime:detail:${anilistId}`,
    () => fetchAnimeDetail(anilistId),
    DETAIL_TTL,
  );

  React.useEffect(() => {
    if (anime) {
      document.title = `Watch ${anime.title} E${episodeNum} — Mori`;
    }
  }, [anime, episodeNum]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="w-full bg-black aspect-video flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </section>
        <section className="container-cine py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-6 w-64 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </section>
      </div>
    );
  }

  // ---- Error / Not Found ----
  if (error || !anime) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          {error ? "Failed to Load Anime" : "Anime Not Found"}
        </h1>
        {error && <p className="text-xs text-muted-foreground mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/anime"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Anime
          </Link>
        </div>
      </div>
    );
  }

  const totalEpisodes = anime.episodes ?? 0;
  const hasPrev = episodeNum > 1;
  const hasNext = totalEpisodes > 0 ? episodeNum < totalEpisodes : true;
  const maxEpisode =
    totalEpisodes > 0 ? totalEpisodes : Math.max(episodeNum, 12);

  return (
    <div className="min-h-screen bg-background">
      {/* Player Section */}
      <section className="w-full bg-black">
        <div className="max-w-[1400px] mx-auto">
          <AnimeWatchPlayer
            anilistId={anilistId}
            episode={episodeNum}
            title={`${anime.title} — Episode ${episodeNum}`}
            coverImage={anime.bannerImage ?? anime.coverImage}
          />
        </div>
      </section>

      {/* ── Mobile Episode Navigation (below player) ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-y border-border sm:hidden">
        {hasPrev ? (
          <Link
            href={`/watch/anime/${anilistId}/${episodeNum - 1}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground/30 cursor-not-allowed">
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </span>
        )}

        <span className="text-xs font-mono text-muted-foreground">
          E{episodeNum} / {totalEpisodes || "?"}
        </span>

        {hasNext ? (
          <Link
            href={`/watch/anime/${anilistId}/${episodeNum + 1}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground/30 cursor-not-allowed">
            Next <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      {/* Episode Info */}
      <section className="container-cine py-6">
        <Link
          href={`/anime/${anilistId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> {anime.title}
        </Link>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-24 sm:w-32 aspect-[2/3] rounded-md overflow-hidden border border-border flex-shrink-0 hidden sm:block">
            <Image
              src={anime.coverImage}
              alt={anime.title}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-primary mb-1">
              Episode {episodeNum}
            </p>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2 break-words">
              {anime.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
              {anime.averageScore && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-foreground font-semibold">
                    {anime.averageScore / 10}%
                  </span>
                </div>
              )}
              {totalEpisodes > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{totalEpisodes} episodes</span>
                </div>
              )}
              {anime.season && anime.seasonYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {anime.season} {anime.seasonYear}
                  </span>
                </div>
              )}
              <span
                className={`px-2 py-0.5 text-[10px] rounded-sm font-medium ${anime.status === "RELEASING" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}
              >
                {anime.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {anime.genres?.map((g: string) => (
                <span
                  key={g}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-primary/10 text-primary border border-primary/20"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop Episode Navigation (full with dropdown) ── */}
        {/* Mobile: dropdown only (prev/next are above player) */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {/* Prev — hidden on mobile */}
          <div className="hidden sm:block">
            {hasPrev ? (
              <Link
                href={`/watch/anime/${anilistId}/${episodeNum - 1}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground/40 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" /> Prev
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-body whitespace-nowrap">
              Episode
            </label>
            <select
              value={episodeNum}
              onChange={(e) => {
                const ep = e.target.value;
                window.location.href = `/watch/anime/${anilistId}/${ep}`;
              }}
              className="h-8 px-2 text-sm font-body bg-muted border border-border text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              {Array.from({ length: maxEpisode }, (_, i) => i + 1).map((ep) => (
                <option key={ep} value={ep}>
                  {ep}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground font-mono">
              / {totalEpisodes || "?"}
            </span>
          </div>

          {/* Next — hidden on mobile */}
          <div className="hidden sm:block">
            {hasNext ? (
              <Link
                href={`/watch/anime/${anilistId}/${episodeNum + 1}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground/40 cursor-not-allowed">
                Next <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
