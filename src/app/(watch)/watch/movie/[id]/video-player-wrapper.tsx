"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getBackdropUrl } from "@/lib/tmdb-image";
import { saveWatchHistory } from "@/lib/watch-history";
import type { VidkingPlayerConfig, EpisodeNavData } from "@/types";

const VideoPlayer = dynamic(
  () =>
    import("@/components/player/video-player").then((m) => ({
      default: m.VideoPlayer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground font-mono">
            Loading player...
          </span>
        </div>
      </div>
    ),
  },
);

interface VideoPlayerWrapperProps {
  tmdbId: number;
  imdbId?: string | null;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  season?: number;
  episode?: number;
  totalSeasons?: number;
  episodesPerSeason?: Record<number, number>;
}

export function VideoPlayerWrapper({
  tmdbId,
  imdbId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  season,
  episode,
  totalSeasons,
  episodesPerSeason,
}: VideoPlayerWrapperProps) {
  const router = useRouter();

  const config: VidkingPlayerConfig = {
    tmdbId,
    imdbId,
    mediaType,
    season,
    episode,
    color: "C5FF4A",
    autoPlay: true,
    nextEpisode: mediaType === "tv",
    episodeSelector: mediaType === "tv",
  };

  const poster = getBackdropUrl(backdropPath ?? posterPath ?? null, "w1280");

  // Build episode navigation data for TV shows
  const episodeNav: EpisodeNavData | undefined =
    mediaType === "tv" && totalSeasons && episodesPerSeason
      ? {
          currentSeason: season ?? 1,
          currentEpisode: episode ?? 1,
          totalSeasons,
          episodesPerSeason,
          onNavigate: (s: number, e: number) => {
            router.push(`/watch/tv/${tmdbId}/${s}/${e}`);
          },
        }
      : undefined;

  // Save to watch history so "Continue Watching" picks it up
  React.useEffect(() => {
    saveWatchHistory({
      id: tmdbId,
      mediaType,
      season,
      episode,
      progress: 0,
      currentTime: 0,
      duration: 0,
      updatedAt: Date.now(),
      posterPath: posterPath ?? null,
      title,
    });
  }, [tmdbId, mediaType, season, episode, posterPath, title]);

  return (
    <div>
      <VideoPlayer
        config={config}
        posterUrl={poster}
        title={title}
        episodeNav={episodeNav}
        className="w-full"
      />
    </div>
  );
}
