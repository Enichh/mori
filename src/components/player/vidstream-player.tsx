"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface VidStreamPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildVidStreamUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, imdbId, mediaType, season, episode } = config;
  const id = imdbId ?? tmdbId;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`;
  }

  return `https://vidsrc.icu/embed/movie/${id}`;
}

export function VidStreamPlayer({
  config,
  onLoad,
  onError,
  className,
}: VidStreamPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildVidStreamUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (VidStream)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load VidStream player. Please try another server.")}
    />
  );
}
