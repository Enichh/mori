"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStillUrl } from "@/lib/tmdb-image";
import type { Episode } from "@/types";

interface EpisodeListProps {
  episodes: Episode[];
  seasonNumber: number;
  tvId: number;
  className?: string;
}

function formatRuntime(minutes?: number | null): string {
  if (!minutes) return "";
  return `${minutes}m`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EpisodeList({
  episodes,
  seasonNumber,
  tvId,
  className,
}: EpisodeListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {episodes.map((episode) => {
        const stillUrl = getStillUrl(episode.stillPath, "w300");
        const runtime = formatRuntime(episode.runtime);
        const airDate = formatDate(episode.airDate);

        return (
          <div
            key={episode.id}
            className="flex gap-4 p-3 bg-card border border-border hover:border-primary/20 hover:bg-card-hover transition-all duration-200 group"
          >
            {/* Still image */}
            <div className="relative w-36 sm:w-44 aspect-video shrink-0 bg-muted overflow-hidden">
              {stillUrl ? (
                <Image
                  src={stillUrl}
                  alt={episode.name}
                  fill
                  sizes="(max-width: 640px) 144px, 176px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <span className="text-xs font-mono">
                    Ep {episode.episodeNumber}
                  </span>
                </div>
              )}

              {/* Play button overlay */}
              <Link
                href={`/watch/tv/${tvId}?season=${seasonNumber}&episode=${episode.episodeNumber}`}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm">
                  <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
                </div>
              </Link>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-body font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  <span className="text-muted-foreground font-mono mr-2">
                    {episode.episodeNumber.toString().padStart(2, "0")}.
                  </span>
                  {episode.name}
                </h4>

                {/* Rating */}
                {episode.voteAverage !== undefined &&
                  episode.voteAverage > 0 && (
                    <span className="text-xs text-primary font-mono shrink-0">
                      {Math.round(episode.voteAverage * 10) / 10}
                    </span>
                  )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 mb-2">
                {runtime && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                    <Clock className="h-3 w-3" />
                    {runtime}
                  </span>
                )}
                {airDate && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                    <Calendar className="h-3 w-3" />
                    {airDate}
                  </span>
                )}
              </div>

              {/* Overview */}
              {episode.overview && (
                <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed">
                  {episode.overview}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
