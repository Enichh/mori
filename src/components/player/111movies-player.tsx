"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface OneElevenMoviesPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function build111MoviesUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://111movies.com/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://111movies.com/movie/${tmdbId}`;
}

export function OneElevenMoviesPlayer({
  config,
  onLoad,
  onError,
  className,
}: OneElevenMoviesPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = build111MoviesUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (111Movies)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load 111Movies player. Please try another server.")}
    />
  );
}
