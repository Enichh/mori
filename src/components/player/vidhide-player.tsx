"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface VidhidePlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildVidhideUrl(config: VidkingPlayerConfig): string {
  const { tmdbId, mediaType, season, episode } = config;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://vidhide.com/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  return `https://vidhide.com/embed/movie/${tmdbId}`;
}

export function VidhidePlayer({
  config,
  onLoad,
  onError,
  className,
}: VidhidePlayerProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  const vidhideUrl = buildVidhideUrl(config);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://vidhide.com") return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data.type === "progress" && data.currentTime) {
          window.dispatchEvent(
            new CustomEvent("mori:watch-progress", {
              detail: {
                mediaId: config.tmdbId,
                mediaType: config.mediaType,
                currentTime: data.currentTime,
                duration: data.duration,
              },
            }),
          );
        }
      } catch {
        // Ignore non-JSON
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [config.tmdbId, config.mediaType]);

  return (
    <iframe
      ref={iframeRef}
      src={vidhideUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player (Vidhide)"
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() => {
        onError?.("Failed to load Vidhide player. Please try another server.");
      }}
    />
  );
}
