"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPosterUrl } from "@/lib/tmdb-image";
import type { Season } from "@/types";

interface SeasonListProps {
  seasons: Season[];
  selectedSeason?: number;
  onSelect: (seasonNumber: number) => void;
  className?: string;
}

export function SeasonList({
  seasons,
  selectedSeason,
  onSelect,
  className,
}: SeasonListProps) {
  return (
    <div className={cn("", className)}>
      <h3 className="font-heading text-sm text-foreground uppercase tracking-wider mb-3">
        Seasons
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {seasons.map((season) => {
          const posterUrl = getPosterUrl(season.posterPath, "w342");
          const isSelected = selectedSeason === season.seasonNumber;
          const year = season.airDate
            ? new Date(season.airDate).getFullYear()
            : null;

          return (
            <button
              key={season.id}
              onClick={() => onSelect(season.seasonNumber)}
              className={cn(
                "text-left group transition-all duration-200",
                "border bg-card overflow-hidden",
                isSelected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/30",
              )}
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] bg-muted overflow-hidden">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={season.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <span className="text-xs font-mono">
                      S{season.seasonNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h4
                  className={cn(
                    "text-sm font-body font-semibold line-clamp-1 transition-colors",
                    isSelected
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary",
                  )}
                >
                  {season.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {year && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {year}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-body">
                    {season.episodeCount} ep
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
