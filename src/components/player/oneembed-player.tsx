"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface OneEmbedPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildOneEmbedUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://1embed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://1embed.cc/embed/movie/${tmdbId}`;
}

export function OneEmbedPlayer({
  config,
  onLoad,
  onError,
  className,
}: OneEmbedPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildOneEmbedUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay *; fullscreen *; picture-in-picture *"
      allowFullScreen
      title="Video Player (1Embed)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load 1Embed player. Please try another server.")}
    />
  );
}
