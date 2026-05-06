"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface EmbedMasterPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildEmbedMasterUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  const params = new URLSearchParams();
  params.set("tmdb", String(tmdbId));

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    params.set("s", String(season));
    params.set("e", String(episode));
  }

  return `https://embedmaster.com/embed?${params.toString()}`;
}

export function EmbedMasterPlayer({
  config,
  onLoad,
  onError,
  className,
}: EmbedMasterPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);

  const embedUrl = buildEmbedMasterUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (EmbedMaster)"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() => {
        onError?.(
          "Failed to load EmbedMaster player. Please try another server.",
        );
      }}
    />
  );
}
