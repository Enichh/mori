"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface MoStreamPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildMoStreamUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  const params = new URLSearchParams();
  params.set("tmdb", String(tmdbId));

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    params.set("s", String(season));
    params.set("e", String(episode));
  }

  return `https://mostream.us/embed?${params.toString()}`;
}

export function MoStreamPlayer({
  config,
  onLoad,
  onError,
  className,
}: MoStreamPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildMoStreamUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (MoStream)"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() =>
        onError?.("Failed to load MoStream player. Please try another server.")
      }
    />
  );
}
