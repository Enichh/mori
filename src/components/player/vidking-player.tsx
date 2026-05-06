"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VidkingPlayerConfig } from "@/types";

interface VidkingPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

function buildVidkingUrl(config: VidkingPlayerConfig): string {
  const {
    tmdbId,
    mediaType,
    season,
    episode,
    color = "C5FF4A",
    autoPlay = true,
    nextEpisode,
    episodeSelector,
  } = config;

  const params = new URLSearchParams();
  params.set("color", color);
  if (autoPlay) params.set("autoPlay", "true");
  if (nextEpisode) params.set("nextEpisode", "true");
  if (episodeSelector) params.set("episodeSelector", "true");

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?${params.toString()}`;
  }

  return `https://www.vidking.net/embed/movie/${tmdbId}?${params.toString()}`;
}

export function VidkingPlayer({
  config,
  onLoad,
  onError,
  className,
}: VidkingPlayerProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  const vidkingUrl = buildVidkingUrl(config);

  // Listen for postMessage events from the player
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin — exact match only (prevents spoofed origins)
      if (event.origin !== "https://www.vidking.net") return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // Handle playback progress events
        if (data.type === "progress" && data.currentTime) {
          // Report progress could be logged to analytics
          if (typeof window !== "undefined") {
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
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [config.tmdbId, config.mediaType]);

  const handleIframeLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleIframeError = () => {
    onError?.("Failed to load Vidking player. Please try another server.");
  };

  return (
    <iframe
      ref={iframeRef}
      src={vidkingUrl}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Video Player"
      onLoad={handleIframeLoad}
      onError={handleIframeError}
    />
  );
}
