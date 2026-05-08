"use client";
import { EpisodeDetailClient } from "./episode-detail-client";

export function EpisodeShell() {
  // /tv/12345/season/2/episode/5 → id=12345, season=2, episode=5
  const parts =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean)
      : [];
  const id = parts[1] || "0";
  const season = parts[3] || "1";
  const episode = parts[5] || "1";
  return (
    <EpisodeDetailClient
      showId={parseInt(id) || 0}
      seasonNum={parseInt(season) || 1}
      episodeNum={parseInt(episode) || 1}
    />
  );
}
