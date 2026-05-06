"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface StreamVaultPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildStreamVaultUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://streamvaultsrc.click/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://streamvaultsrc.click/embed/movie/${tmdbId}`;
}

export function StreamVaultPlayer({
  config,
  onLoad,
  onError,
  className,
}: StreamVaultPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildStreamVaultUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (StreamVault)"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() =>
        onError?.(
          "Failed to load StreamVault player. Please try another server.",
        )
      }
    />
  );
}
