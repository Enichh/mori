"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface VidLinkPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildVidLinkUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, imdbId, mediaType, season, episode } = config;
  const id = imdbId ?? tmdbId;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
  }

  return `https://vidlink.pro/movie/${id}`;
}

export function VidLinkPlayer({
  config,
  onLoad,
  onError,
  className,
}: VidLinkPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildVidLinkUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (VidLink)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load VidLink player. Please try another server.")}
    />
  );
}
