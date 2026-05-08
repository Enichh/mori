"use client";
import { VideoPlayerWrapper } from "@/app/(watch)/watch/movie/[id]/video-player-wrapper";

export function WatchTVShell() {
  const parts =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean)
      : [];
  const id = parts[2] || "0";
  const season = parts[3] || "1";
  const episode = parts[4] || "1";
  return (
    <VideoPlayerWrapper
      tmdbId={parseInt(id) || 0}
      imdbId={null}
      mediaType="tv"
      title=""
      season={parseInt(season) || 1}
      episode={parseInt(episode) || 1}
    />
  );
}
