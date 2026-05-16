"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EpisodeNavigatorProps {
  currentSeason: number;
  currentEpisode: number;
  totalSeasons: number;
  episodesPerSeason: Record<number, number>; // season number -> total episodes
  onNavigate: (season: number, episode: number) => void;
  className?: string;
}

export function EpisodeNavigator({
  currentSeason,
  currentEpisode,
  totalSeasons,
  episodesPerSeason,
  onNavigate,
  className,
}: EpisodeNavigatorProps) {
  const totalEpisodes = episodesPerSeason[currentSeason] || 1;

  const goToPrevious = () => {
    if (currentEpisode > 1) {
      onNavigate(currentSeason, currentEpisode - 1);
    } else if (currentSeason > 1) {
      const prevSeasonEpisodes = episodesPerSeason[currentSeason - 1] || 1;
      onNavigate(currentSeason - 1, prevSeasonEpisodes);
    }
  };

  const goToNext = () => {
    if (currentEpisode < totalEpisodes) {
      onNavigate(currentSeason, currentEpisode + 1);
    } else if (currentSeason < totalSeasons) {
      onNavigate(currentSeason + 1, 1);
    }
  };

  const canGoPrevious = currentEpisode > 1 || currentSeason > 1;
  const canGoNext =
    currentEpisode < totalEpisodes || currentSeason < totalSeasons;

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-wrap gap-x-2 gap-y-3",
        className,
      )}
    >
      <button
        onClick={goToPrevious}
        disabled={!canGoPrevious}
        className={cn(
          "flex items-center gap-1 px-2.5 py-2 text-xs sm:text-sm font-body transition-colors shrink-0",
          "disabled:opacity-30 disabled:pointer-events-none",
          "text-muted-foreground hover:text-foreground border border-border rounded-md hover:border-primary/50",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
        {/* Season selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] sm:text-xs text-muted-foreground font-body whitespace-nowrap">
            Season
          </label>
          <select
            value={currentSeason}
            onChange={(e) => onNavigate(Number(e.target.value), 1)}
            className={cn(
              "h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm font-body bg-muted border border-border text-foreground",
              "focus:outline-none focus:border-primary",
              "appearance-none cursor-pointer",
            )}
          >
            {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Episode selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] sm:text-xs text-muted-foreground font-body whitespace-nowrap">
            Episode
          </label>
          <select
            value={currentEpisode}
            onChange={(e) => onNavigate(currentSeason, Number(e.target.value))}
            className={cn(
              "h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm font-body bg-muted border border-border text-foreground",
              "focus:outline-none focus:border-primary",
              "appearance-none cursor-pointer",
            )}
          >
            {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(
              (ep) => (
                <option key={ep} value={ep}>
                  {ep}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <button
        onClick={goToNext}
        disabled={!canGoNext}
        className={cn(
          "flex items-center gap-1 px-2.5 py-2 text-xs sm:text-sm font-body transition-colors shrink-0",
          "disabled:opacity-30 disabled:pointer-events-none",
          "text-muted-foreground hover:text-foreground border border-border rounded-md hover:border-primary/50",
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
