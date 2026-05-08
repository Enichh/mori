"use client";
import { VideoPlayerWrapper } from "./video-player-wrapper";

export function WatchMovieShell() {
  const id =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop() || "0"
      : "0";
  return (
    <VideoPlayerWrapper
      tmdbId={parseInt(id) || 0}
      imdbId={null}
      mediaType="movie"
      title=""
    />
  );
}
