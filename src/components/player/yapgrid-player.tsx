"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface YapGridPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildYapGridUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://yapgrid.com/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://yapgrid.com/embed/movie/${tmdbId}`;
}

export function YapGridPlayer({
  config,
  onLoad,
  onError,
  className,
}: YapGridPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildYapGridUrl(config);

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
