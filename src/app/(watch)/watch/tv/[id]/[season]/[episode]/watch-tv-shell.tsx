"use client";
import { useState, useEffect } from "react";
import { VideoPlayerWrapper } from "@/app/(watch)/watch/movie/[id]/video-player-wrapper";

interface TVDetail {
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  totalSeasons: number;
  episodesPerSeason: Record<number, number>;
}

async function fetchTVDetail(tmdbId: number): Promise<TVDetail | null> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${key}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const eps: Record<number, number> = {};
    for (const s of data.seasons || []) {
      if (s.season_number > 0) {
        eps[s.season_number] = s.episode_count || 0;
      }
    }
    return {
      title: data.name || "",
      posterPath: data.poster_path || null,
      backdropPath: data.backdrop_path || null,
      totalSeasons: data.number_of_seasons || Object.keys(eps).length,
      episodesPerSeason: eps,
    };
  } catch {
    return null;
  }
}

export function WatchTVShell() {
  const [id, setId] = useState<string | null>(null);
  const [season, setSeason] = useState<string | null>(null);
  const [episode, setEpisode] = useState<string | null>(null);
  const [detail, setDetail] = useState<TVDetail | null>(null);

  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const tmdbId = parts[2] || "0";
    const s = parts[3] || "1";
    const e = parts[4] || "1";
    setId(tmdbId);
    setSeason(s);
    setEpisode(e);
    fetchTVDetail(parseInt(tmdbId)).then((d) => {
      if (d) {
        setDetail(d);
        document.title = `Watch ${d.title} S${s}E${e} — Mori`;
      }
    });
  }, []);

  // Don't render VideoPlayerWrapper until we have all real values.
  // This prevents a ghost id=0 / season=1 / episode=1 entry in watch history.
  if (!id || !season || !episode || !detail) return null;

  return (
    <VideoPlayerWrapper
      tmdbId={parseInt(id) || 0}
      imdbId={null}
      mediaType="tv"
      title={detail.title}
      posterPath={detail.posterPath}
      backdropPath={detail.backdropPath}
      season={parseInt(season) || 1}
      episode={parseInt(episode) || 1}
      totalSeasons={detail.totalSeasons}
      episodesPerSeason={detail.episodesPerSeason}
    />
  );
}
