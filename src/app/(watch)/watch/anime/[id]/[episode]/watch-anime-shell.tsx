"use client";
import { useState, useEffect } from "react";
import { AnimeWatchClient } from "./anime-watch-client";

export function WatchAnimeShell() {
  const [id, setId] = useState("0");
  const [episode, setEpisode] = useState("1");
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    setId(parts[2] || "0");
    setEpisode(parts[3] || "1");
  }, []);
  return (
    <AnimeWatchClient
      anilistId={parseInt(id) || 0}
      episode={parseInt(episode) || 1}
    />
  );
}
