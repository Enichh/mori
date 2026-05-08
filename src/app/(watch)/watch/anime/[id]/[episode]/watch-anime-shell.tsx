"use client";
import { AnimeWatchClient } from "./anime-watch-client";

export function WatchAnimeShell() {
  const parts =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean)
      : [];
  const id = parts[2] || "0";
  const episode = parts[3] || "1";
  return (
    <AnimeWatchClient
      anilistId={parseInt(id) || 0}
      episode={parseInt(episode) || 1}
    />
  );
}
