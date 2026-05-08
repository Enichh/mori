"use client";
import { useState, useEffect } from "react";
import { MovieDetailClient } from "./movie-detail-client";

export function MovieShell() {
  const [id, setId] = useState("0");
  useEffect(() => {
    const pathId =
      window.location.pathname.split("/").filter(Boolean).pop() || "0";
    setId(pathId);
  }, []);
  return <MovieDetailClient movieId={parseInt(id) || 0} />;
}
