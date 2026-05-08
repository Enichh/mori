"use client";
import { useParams } from "next/navigation";
import { VideoPlayerWrapper } from "./video-player-wrapper";

export function WatchMovieShell() {
  const { id } = useParams<{ id: string }>();
  return <VideoPlayerWrapper tmdbId={parseInt(id || "0")} imdbId={null} mediaType="movie" title="" />;
}
