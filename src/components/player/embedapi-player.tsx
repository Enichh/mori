"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface EmbedAPIPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildEmbedApiUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  const params = new URLSearchParams();
  params.set("id", String(tmdbId));

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    params.set("s", String(season));
    params.set("e", String(episode));
  }

  return `https://player.embed-api.stream/?${params.toString()}`;
}

export function EmbedAPIPlayer({
  config,
  onLoad,
  onError,
  className,
}: EmbedAPIPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);

  const embedUrl = buildEmbedApiUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (Embed-API)"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() => {
        onError?.("Failed to load Embed-API player. Please try another server.");
      }}
    />
  );
}
