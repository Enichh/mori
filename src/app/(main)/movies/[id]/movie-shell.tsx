"use client";
import { useParams } from "next/navigation";
import { MovieDetailClient } from "./movie-detail-client";

export function MovieShell() {
  const { id } = useParams<{ id: string }>();
  return <MovieDetailClient movieId={parseInt(id || "0")} />;
}
