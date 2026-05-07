"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/player/video-player";
import { getBackdropUrl } from "@/lib/tmdb-image";
import { saveWatchHistory } from "@/lib/watch-history";
import type { VidkingPlayerConfig, EpisodeNavData } from "@/types";

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
