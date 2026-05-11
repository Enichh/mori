"use client";
import { useState, useEffect } from "react";
import { VideoPlayerWrapper } from "./video-player-wrapper";

async function fetchMovieTitle(tmdbId: number): Promise<string> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${key}`,
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.title || data.name || "";
  } catch {
    return "";
  }
}

export function WatchMovieShell() {
  const [id, setId] = useState("0");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const pathId =
      window.location.pathname.split("/").filter(Boolean).pop() || "0";
    setId(pathId);
    const tmdbId = parseInt(pathId) || 0;
    if (tmdbId) {
      fetchMovieTitle(tmdbId).then((t) => {
        if (t) {
          setTitle(t);
          document.title = `Watch ${t} — Mori`;
        }
      });
    }
  }, []);

  return (
    <VideoPlayerWrapper
      tmdbId={parseInt(id) || 0}
      imdbId={null}
      mediaType="movie"
      title={title}
    />
  );
}
