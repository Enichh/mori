"use client";
import { useParams } from "next/navigation";
import { AnimeWatchClient } from "./anime-watch-client";

export function WatchAnimeShell() {
  const p = useParams<{ id: string; episode: string }>();
  return <AnimeWatchClient anilistId={parseInt(p.id||"0")} episode={parseInt(p.episode||"1")} />;
}
