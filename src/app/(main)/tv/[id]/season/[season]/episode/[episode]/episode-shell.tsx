"use client";
import { useState, useEffect } from "react";
import { EpisodeDetailClient } from "./episode-detail-client";

export function EpisodeShell() {
  const [id, setId] = useState("0");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    setId(parts[1] || "0");
    setSeason(parts[3] || "1");
    setEpisode(parts[5] || "1");
  }, []);
  return (
    <EpisodeDetailClient
      showId={parseInt(id) || 0}
      seasonNum={parseInt(season) || 1}
      episodeNum={parseInt(episode) || 1}
    />
  );
}
