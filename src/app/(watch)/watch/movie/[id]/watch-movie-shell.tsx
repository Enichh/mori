"use client";
import { useState, useEffect } from "react";
import { VideoPlayerWrapper } from "./video-player-wrapper";

interface MovieDetail {
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
}

async function fetchMovieDetail(tmdbId: number): Promise<MovieDetail> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) return { title: "", posterPath: null, backdropPath: null };
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${key}`,
    );
    if (!res.ok) return { title: "", posterPath: null, backdropPath: null };
    const data = await res.json();
    return {
      title: data.title || data.name || "",
      posterPath: data.poster_path || null,
      backdropPath: data.backdrop_path || null,
    };
  } catch {
    return { title: "", posterPath: null, backdropPath: null };
  }
}

export function WatchMovieShell() {
  const [id, setId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MovieDetail | null>(null);

  useEffect(() => {
    const pathId =
      window.location.pathname.split("/").filter(Boolean).pop() || "0";
    setId(pathId);
    const tmdbId = parseInt(pathId) || 0;
    if (tmdbId) {
      fetchMovieDetail(tmdbId).then((d) => {
        setDetail(d);
        if (d.title) {
          document.title = `Watch ${d.title} — Mori`;
        }
      });
    }
  }, []);

  // Don't render VideoPlayerWrapper until we have the real ID and detail.
  // This prevents a ghost id=0 entry in watch history.
  if (!id || !detail) return null;

  return (
    <VideoPlayerWrapper
      tmdbId={parseInt(id) || 0}
      imdbId={null}
      mediaType="movie"
      title={detail.title}
      posterPath={detail.posterPath}
      backdropPath={detail.backdropPath}
    />
  );
}
