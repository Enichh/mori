"use client";
import { TVDetailClient } from "./tv-detail-client";

export function TVShell() {
  const id =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop() || "0"
      : "0";
  return <TVDetailClient showId={parseInt(id) || 0} />;
}
