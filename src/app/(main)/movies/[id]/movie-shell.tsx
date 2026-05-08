"use client";
import { MovieDetailClient } from "./movie-detail-client";

export function MovieShell() {
  // Read ID from URL path — more reliable than useParams with CDN rewrites
  const id =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop() || "0"
      : "0";
  return <MovieDetailClient movieId={parseInt(id) || 0} />;
}
