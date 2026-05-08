"use client";
import { useState, useEffect } from "react";
import { VideoPlayerWrapper } from "./video-player-wrapper";

export function WatchMovieShell() {
  const [id, setId] = useState("0");
  useEffect(() => {
    const pathId =
      window.location.pathname.split("/").filter(Boolean).pop() || "0";
    setId(pathId);
  }, []);
  return (
    <VideoPlayerWrapper
      tmdbId={parseInt(id) || 0}
      imdbId={null}
      mediaType="movie"
      title=""
    />
  );
}
