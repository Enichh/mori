"use client";
import { useParams } from "next/navigation";
import { EpisodeDetailClient } from "./episode-detail-client";

export function EpisodeShell() {
  const p = useParams<{ id: string; season: string; episode: string }>();
  return <EpisodeDetailClient showId={parseInt(p.id||"0")} seasonNum={parseInt(p.season||"1")} episodeNum={parseInt(p.episode||"1")} />;
}
