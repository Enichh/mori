"use client";
import { useParams } from "next/navigation";
import { AnimeDetailClient } from "./anime-detail-client";

export function AnimeShell() {
  const { id } = useParams<{ id: string }>();
  return <AnimeDetailClient anilistId={parseInt(id || "0")} />;
}
