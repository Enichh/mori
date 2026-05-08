"use client";
import { useParams } from "next/navigation";
import { VideoPlayerWrapper } from "@/app/(watch)/watch/movie/[id]/video-player-wrapper";

export function WatchTVShell() {
  const p = useParams<{ id: string; season: string; episode: string }>();
  return <VideoPlayerWrapper tmdbId={parseInt(p.id||"0")} imdbId={null} mediaType="tv" title="" season={parseInt(p.season||"1")} episode={parseInt(p.episode||"1")} />;
}
