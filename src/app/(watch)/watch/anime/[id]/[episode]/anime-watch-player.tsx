"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { VidkingPlayerConfig } from "@/types";

const ConsumetPlayer = dynamic(
  () =>
    import("@/components/player/consumet-player").then((m) => ({
      default: m.ConsumetPlayer,
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
    tmdbId: anilistId,
    mediaType: "anime" as any,
    season: 1,
    episode,
    color: "C5FF4A",
    autoPlay: true,
  };

  return (
    <div className="w-full">
      <ConsumetPlayer
        config={config}
        title={title}
        className="w-full aspect-video"
      />
      <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-muted-foreground/50 font-mono">
        <span>Powered by AniList</span>
      </div>
    </div>
  );
}
