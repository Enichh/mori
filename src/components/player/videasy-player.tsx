"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface VideasyPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildVideasyUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://player.videasy.net/movie/${tmdbId}`;
}

export function VideasyPlayer({
  config,
  onLoad,
  onError,
  className,
}: VideasyPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildVideasyUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay *; fullscreen *; picture-in-picture *"
      allowFullScreen
      title="Video Player (Videasy)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load Videasy player. Please try another server.")}
    />
  );
}
