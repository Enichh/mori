"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface ApiPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildApiPlayerUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://apiplayer.ru/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://apiplayer.ru/embed/movie/${tmdbId}`;
}

export function ApiPlayer({
  config,
  onLoad,
  onError,
  className,
}: ApiPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildApiPlayerUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() =>
        onError?.("Failed to load player. Please try another server.")
      }
    />
  );
}
