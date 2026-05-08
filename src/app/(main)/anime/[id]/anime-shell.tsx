"use client";
import { useState, useEffect } from "react";
import { AnimeDetailClient } from "./anime-detail-client";

export function AnimeShell() {
  const [id, setId] = useState("0");
  useEffect(() => {
    const pathId =
      window.location.pathname.split("/").filter(Boolean).pop() || "0";
    setId(pathId);
  }, []);
  return <AnimeDetailClient anilistId={parseInt(id) || 0} />;
}
