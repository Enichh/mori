"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ConsumetService } from "@/services/consumet";
import { Loader2, AlertTriangle } from "lucide-react";
import type { VidkingPlayerConfig } from "@/types";

interface ConsumetPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

export function ConsumetPlayer({
  config,
  onLoad,
  onError,
  className,
}: ConsumetPlayerProps) {
  const { tmdbId, imdbId, season, episode } = config;
  const anilistId = tmdbId; // For anime, tmdbId field carries the AniList ID
  const epNum = episode ?? 1;

  const [sourceUrl, setSourceUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    const consumet = new ConsumetService();

    async function fetchStream() {
      try {
        setLoading(true);
        setError(null);

        // 1Anime CDN: direct stream by AniList ID + episode number
        const sources = await consumet.getStream(anilistId, epNum);
        if (!sources || !sources.sources?.length) {
          throw new Error("No streaming sources available");
        }

        if (!cancelled) {
          // Prefer m3u8, fall back to first source
          const bestSource =
            sources.sources.find((s: any) => s.isM3U8) ?? sources.sources[0];
          setSourceUrl(bestSource.url);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load stream",
          );
          setLoading(false);
          onError?.(
            err instanceof Error ? err.message : "Failed to load stream",
          );
        }
      }
    }

    fetchStream();
    return () => {
      cancelled = true;
    };
  }, [anilistId, epNum]);

  if (loading) {
    return (
      <div
        className={cn(
          "w-full aspect-video bg-black flex flex-col items-center justify-center gap-4",
          className,
        )}
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-mono">
          Fetching stream from 1Anime CDN...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "w-full aspect-video bg-black flex flex-col items-center justify-center gap-3",
          className,
        )}
      >
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground font-body text-center px-4">
          {error}
        </p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={sourceUrl!}
      className={cn("w-full h-full", !loaded && "invisible", className)}
      controls
      autoPlay
      playsInline
      crossOrigin="anonymous"
      onLoadedData={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() =>
        onError?.("Failed to play video. Please try another server.")
      }
    />
  );
}
