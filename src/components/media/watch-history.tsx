"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Play, History, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPosterUrl } from "@/lib/tmdb-image";
import { getWatchHistory, removeWatchHistory } from "@/lib/watch-history";
import type { WatchProgress } from "@/types";

interface WatchHistoryProps {
  maxItems?: number;
  className?: string;
}

export function WatchHistory({ maxItems = 8, className }: WatchHistoryProps) {
  const [history, setHistory] = React.useState<WatchProgress[]>([]);
  const [mounted, setMounted] = React.useState(false);

  const loadHistory = React.useCallback(() => {
    const items = getWatchHistory();
    // Already deduplicated by saveWatchHistory, but guard anyway
    const seen = new Set<string>();
    const unique = items.filter((item: WatchProgress) => {
      const key = `${item.mediaType}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setHistory(unique.slice(0, maxItems));
  }, [maxItems]);

  React.useEffect(() => {
    setMounted(true);
    loadHistory();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mori:watch-history") {
        loadHistory();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom event dispatched when watch history updates
    const handleHistoryUpdate = () => loadHistory();
    window.addEventListener("mori:history-updated", handleHistoryUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("mori:history-updated", handleHistoryUpdate);
    };
  }, [loadHistory]);

  const handleRemove = (e: React.MouseEvent, id: number, mediaType: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeWatchHistory(id, mediaType);
    loadHistory();
  };

  if (!mounted || history.length === 0) return null;

  return (
    <section className={cn("py-10", className)}>
      <div className="container-cine">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground">
              Continue Watching
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-sm">
              {history.length}
            </span>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-none -mx-1 px-1">
          {history.map((item) => {
            const href =
              item.mediaType === "movie"
                ? `/watch/movie/${item.id}`
                : `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`;

            const displayTitle =
              item.title ||
              (item.mediaType === "movie"
                ? "Movie"
                : `S${item.season} E${item.episode}`);

            const progressPct = Math.min(item.progress || 0, 100);

            return (
              <Link
                key={`${item.mediaType}-${item.id}`}
                href={href}
                className="flex-shrink-0 w-36 sm:w-40 group relative"
              >
                {/* Poster with progress bar */}
                <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-muted border border-border group-hover:border-primary/50 transition-colors">
                  {item.posterPath ? (
                    <Image
                      src={getPosterUrl(item.posterPath, "w342")}
                      alt={displayTitle}
                      fill
                      sizes="160px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Play className="w-8 h-8 opacity-30" />
                    </div>
                  )}

                  {/* Progress bar at bottom */}
                  {progressPct > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}

                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(e, item.id, item.mediaType)}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white/60 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label={`Remove ${displayTitle} from history`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Title + meta */}
                <div className="mt-2 px-0.5">
                  <p className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {displayTitle}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.mediaType === "movie"
                      ? "Movie"
                      : `S${item.season} E${item.episode}`}
                    {progressPct > 0 && ` · ${Math.round(progressPct)}%`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
