"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Users, Trophy, Dumbbell, Car, Target, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveBadge } from "@/components/sports/live-badge";
import type { SportEvent } from "@/types";

// ---- Sport-specific fallback when no team/event image exists ----

const SPORT_FALLBACK: Record<
  string,
  { icon: React.ElementType; gradient: string }
> = {
  basketball: { icon: Trophy, gradient: "from-orange-600/40 to-red-800/40" },
  football: { icon: Flag, gradient: "from-green-600/40 to-emerald-900/40" },
  baseball: { icon: Target, gradient: "from-blue-600/40 to-navy-900/40" },
  hockey: { icon: Target, gradient: "from-cyan-600/40 to-blue-900/40" },
  fight: { icon: Dumbbell, gradient: "from-red-700/40 to-zinc-900/40" },
  motorsport: { icon: Car, gradient: "from-yellow-600/40 to-red-900/40" },
  tennis: { icon: Target, gradient: "from-lime-600/40 to-green-900/40" },
  golf: { icon: Flag, gradient: "from-emerald-600/40 to-teal-900/40" },
  cricket: { icon: Target, gradient: "from-sky-600/40 to-indigo-900/40" },
  darts: { icon: Target, gradient: "from-red-600/40 to-rose-900/40" },
};

interface SportCardProps {
  event: SportEvent;
  priority?: boolean;
  className?: string;
}

/** Resolve a poster URL: cdnlivetv provides absolute URLs, use as-is.
 *  Filters out the generic placeholder event.png that cdnlivetv returns
 *  for individual sports with no real artwork. */
function resolvePosterUrl(poster: string | null): string | null {
  if (!poster) return null;
  // Ignore the generic placeholder image
  if (poster.endsWith("/team/event.png")) return null;
  if (poster.startsWith("http")) return poster;
  return null;
}

/** Format a Unix-ms timestamp into a short time string (e.g. "2:30 PM"). */
function formatTime(ts: number): string | null {
  if (!ts) return null;
  try {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

/** Format viewer count (e.g. 1200 → "1.2K"). */
function formatViewers(count: number | undefined): string | null {
  if (!count) return null;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export function SportCard({
  event,
  priority = false,
  className,
}: SportCardProps) {
  const posterUrl = resolvePosterUrl(event.poster);
  const title =
    event.title ||
    (event.teams
      ? `${event.teams.home.name} vs ${event.teams.away.name}`
      : "Unknown Event");
  const timeStr = formatTime(event.date);
  const viewerStr = formatViewers(event.viewerCount);
  const isFinished = event.status === "finished";

  return (
    <Link
      href={`/watch/sport/${event.id}`}
      className={cn(
        "group block",
        isFinished && "opacity-75 hover:opacity-100",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted aspect-[2/3]",
          isFinished && "grayscale-[30%]",
        )}
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
              isFinished && "group-hover:grayscale-0",
            )}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          (() => {
            const fb = SPORT_FALLBACK[event.category] ?? {
              icon: Trophy,
              gradient: "from-muted/40 to-card/40",
            };
            const Icon = fb.icon;
            return (
              <div
                className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br",
                  fb.gradient,
                )}
              >
                <Icon className="h-12 w-12 mb-2 text-white/30" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  {event.category.replace(/-/g, " ")}
                </span>
              </div>
            );
          })()
        )}

        {/* Status badge */}
        {event.status && (
          <div className="absolute top-2 left-2 z-10">
            <LiveBadge status={event.status} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm">
            <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-1.5">
        <h3
          className={cn(
            "text-xs sm:text-sm font-body font-medium line-clamp-1 break-words group-hover:text-primary transition-colors",
            isFinished ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {timeStr && (
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">
              {timeStr}
            </p>
          )}
          {event.tournament && (
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
              {event.tournament}
            </p>
          )}
        </div>
        {viewerStr && (
          <div className="flex items-center gap-1 mt-0.5">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono">
              {viewerStr}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
