"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface CineSrcPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildCineSrcUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`;
  }

  return `https://cinesrc.st/embed/movie/${tmdbId}`;
}

export function CineSrcPlayer({
  config,
  onLoad,
  onError,
  className,
}: CineSrcPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildCineSrcUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay *; fullscreen *; picture-in-picture *"
      allowFullScreen
      title="Video Player (CineSrc)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load CineSrc player. Please try another server.")}
    />
  );
}
