"use client";

import * as React from "react";
import { ConsumetPlayer } from "@/components/player/consumet-player";
import type { VidkingPlayerConfig } from "@/types";

interface AnimeWatchPlayerProps {
  anilistId: number;
  episode: number;
  title: string;
  coverImage?: string | null;
}

export function AnimeWatchPlayer({
  anilistId,
  episode,
  title,
  coverImage,
}: AnimeWatchPlayerProps) {
  const config: VidkingPlayerConfig = {
    tmdbId: anilistId, // Repurposed: carries AniList ID
    mediaType: "anime" as any,
    season: 1,
    episode,
    color: "C5FF4A",
    autoPlay: true,
  };

  return (
    <div className="w-full">
      <ConsumetPlayer config={config} className="w-full aspect-video" />
      <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-muted-foreground/50 font-mono">
        <span>Streaming via 1Anime CDN · Powered by AniList</span>
      </div>
    </div>
  );
}
