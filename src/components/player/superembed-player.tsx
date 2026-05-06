"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface SuperEmbedPlayerProps {
  config: VidkingPlayerConfig;
  useVip?: boolean;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildSuperEmbedUrl(config: VidkingPlayerConfig, useVip = false): string {
  const { tmdbId, mediaType, season, episode } = config;

  const base = useVip
    ? "https://multiembed.mov/directstream.php"
    : "https://multiembed.mov/";

  const params = new URLSearchParams();
  params.set("video_id", String(tmdbId));
  params.set("tmdb", "1");

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    params.set("s", String(season));
    params.set("e", String(episode));
  }

  return `${base}?${params.toString()}`;
}

export function SuperEmbedPlayer({
  config,
  useVip = true,
  onLoad,
  onError,
  className,
}: SuperEmbedPlayerProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  const embedUrl = buildSuperEmbedUrl(config, useVip);

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (SuperEmbed)"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() => {
        onError?.("Failed to load SuperEmbed player. Please try another server.");
      }}
    />
  );
}
