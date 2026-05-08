"use client";
import { useParams } from "next/navigation";
import { TVDetailClient } from "./tv-detail-client";

export function TVShell() {
  const { id } = useParams<{ id: string }>();
  return <TVDetailClient showId={parseInt(id || "0")} />;
}
