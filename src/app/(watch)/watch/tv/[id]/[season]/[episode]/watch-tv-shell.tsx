"use client";
import { useState, useEffect } from "react";
import { VideoPlayerWrapper } from "@/app/(watch)/watch/movie/[id]/video-player-wrapper";

export function WatchTVShell() {
  const [id, setId] = useState("0");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    setId(parts[2] || "0");
    setSeason(parts[3] || "1");
    setEpisode(parts[4] || "1");
  }, []);
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
