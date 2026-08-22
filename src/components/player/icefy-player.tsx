"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface IcefyPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildIcefyUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://embed.icefy.top/tv?id=${tmdbId}&season=${season}&episode=${episode}`;
  }

  return `https://embed.icefy.top/movie?id=${tmdbId}`;
}

export function IcefyPlayer({
  config,
  onLoad,
  onError,
  className,
}: IcefyPlayerProps) {
  const [loaded, setLoaded] = React.useState(false);
  const embedUrl = buildIcefyUrl(config);

  return (
    <iframe
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay *; fullscreen *; picture-in-picture *"
      allowFullScreen
      title="Video Player (Icefy)"
      onLoad={() => { setLoaded(true); onLoad?.(); }}
      onError={() => onError?.("Failed to load Icefy player. Please try another server.")}
    />
  );
}
