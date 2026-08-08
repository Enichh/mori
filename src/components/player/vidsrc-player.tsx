"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface VidSrcPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildVidSrcUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://vidsrc.mov/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://vidsrc.mov/embed/movie/${tmdbId}`;
}

export function VidSrcPlayer({
  config,
  onLoad,
  onError,
  className,
}: VidSrcPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildVidSrcUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay *; fullscreen *; picture-in-picture *"
      allowFullScreen
      title="Video Player (VidSrc)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load VidSrc player. Please try another server.")}
    />
  );
}
