"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface EzVidApiPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildEzVidApiUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://ezvidapi.com/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://ezvidapi.com/embed/movie/${tmdbId}`;
}

export function EzVidApiPlayer({
  config,
  onLoad,
  onError,
  className,
}: EzVidApiPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildEzVidApiUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (vid.api)"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() =>
        onError?.("Failed to load vid.api player. Please try another server.")
      }
    />
  );
}
