"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface TwoEmbedPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildTwoEmbedUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
  }

  return `https://www.2embed.cc/embed/${tmdbId}`;
}

export function TwoEmbedPlayer({
  config,
  onLoad,
  onError,
  className,
}: TwoEmbedPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildTwoEmbedUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay *; fullscreen *; picture-in-picture *"
      allowFullScreen
      title="Video Player (2Embed)"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() =>
        onError?.("Failed to load 2Embed player. Please try another server.")
      }
    />
  );
}
