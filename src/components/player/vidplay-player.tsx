"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface VidPlayPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildVidPlayUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, imdbId, mediaType, season, episode } = config;
  const id = imdbId ?? tmdbId;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
  }

  return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false`;
}

export function VidPlayPlayer({
  config,
  onLoad,
  onError,
  className,
}: VidPlayPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildVidPlayUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (VidPlay)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load VidPlay player. Please try another server.")}
    />
  );
}
