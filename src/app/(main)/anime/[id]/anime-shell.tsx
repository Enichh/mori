"use client";
import { AnimeDetailClient } from "./anime-detail-client";

export function AnimeShell() {
  const id =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop() || "0"
      : "0";
  return <AnimeDetailClient anilistId={parseInt(id) || 0} />;
}
