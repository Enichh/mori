"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface CinextreamPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildCinextreamUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://cinextream.cc/api/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://cinextream.cc/api/embed/movie/${tmdbId}`;
}

export function CinextreamPlayer({
  config,
  onLoad,
  onError,
  className,
}: CinextreamPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildCinextreamUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay *; fullscreen *; picture-in-picture *"
      allowFullScreen
      title="Video Player (Cinextream)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load Cinextream player. Please try another server.")}
    />
  );
}
