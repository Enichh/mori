"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface VidLovePlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildVidLoveUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://player.vidlove.cc/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://player.vidlove.cc/embed/movie/${tmdbId}`;
}

export function VidLovePlayer({
  config,
  onLoad,
  onError,
  className,
}: VidLovePlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildVidLoveUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay *; fullscreen *; picture-in-picture *"
      allowFullScreen
      title="Video Player (VidLove)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load VidLove player. Please try another server.")}
    />
  );
}
