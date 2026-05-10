"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveBadge } from "@/components/sports/live-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonHero } from "@/components/ui/skeleton";
import type { SportEvent } from "@/types";

interface SportHeroProps {
  event?: SportEvent | null;
  isLoading?: boolean;
  className?: string;
}

/** Resolve a poster URL: cdnlivetv provides absolute URLs, use as-is. */
function resolvePosterUrl(poster: string | null): string | null {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  return null; // Don't construct URLs — cdnlivetv always returns full URLs
}

/** Format a Unix-ms timestamp into a readable time string. */
function formatDateTime(ts: number): string | null {
  if (!ts) return null;
  try {
    return new Date(ts).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
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
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M viewers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K viewers`;
  return `${count} viewers`;
}

export function SportHero({
  event,
  isLoading = false,
  className,
}: SportHeroProps) {
  if (isLoading || !event) {
    return (
      <section
        className={cn(
          "relative min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card",
          className,
        )}
      >
        <div className="container-cine text-center py-16">
          <h1 className="text-3xl md:text-5xl font-heading font-bold">
            Live Sports
          </h1>
          <p className="text-muted-foreground">
            Stream live sports from around the world.
          </p>
        </div>
      </section>
    );
  }

  const backdropUrl = resolvePosterUrl(event.poster);
  const title =
    event.title ||
    (event.teams
      ? `${event.teams.home.name} vs ${event.teams.away.name}`
      : "Unknown Event");
  const dateStr = formatDateTime(event.date);
  const viewerStr = formatViewers(event.viewerCount);

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-black pt-16",
        className,
      )}
    >
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full scanlines">
        {/* Backdrop image */}
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="eager"
          />
        )}

        {/* Radial glow overlay */}
        <div className="absolute inset-0 gradient-radial-hero" />

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12 max-w-3xl z-10 mt-16">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {event.status && (
              <LiveBadge status={event.status} className="text-xs px-3 py-1" />
            )}
            {dateStr && (
              <span className="text-xs text-muted-foreground font-mono tracking-widest">
                {dateStr}
              </span>
            )}
            {event.tournament && (
              <Badge variant="outline" className="text-[10px] tracking-wider">
                {event.tournament}
              </Badge>
            )}
            {event.category && (
              <Badge
                variant="outline"
                className="text-[10px] tracking-wider uppercase"
              >
                {event.category.replace(/-/g, " ")}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading font-normal italic text-display-sm md:text-display-md lg:text-display-lg text-foreground mb-4 leading-[0.95] tracking-[-0.02em] text-balance">
            {title.split(" ").map((word, i, arr) => {
              if (i % 3 === 0 && i > 0) {
                return (
                  <React.Fragment key={i}>
                    <em className="not-italic text-primary animate-breath-lime">
                      {word}
                    </em>
                    {i < arr.length - 1 ? " " : ""}
                  </React.Fragment>
                );
              }
              return (
                <React.Fragment key={i}>
                  {word}
                  {i < arr.length - 1 ? " " : ""}
                </React.Fragment>
              );
            })}
          </h1>

          {/* Teams / viewer info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {event.teams ? (
              <div className="flex items-center gap-3">
                {event.teams.home.badge && (
                  <img
                    src={event.teams.home.badge}
                    alt={event.teams.home.name}
                    className="h-10 w-10 object-contain"
                  />
                )}
                <span className="text-sm md:text-base font-body font-semibold text-foreground">
                  {event.teams.home.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  vs
                </span>
                <span className="text-sm md:text-base font-body font-semibold text-foreground">
                  {event.teams.away.name}
                </span>
                {event.teams.away.badge && (
                  <img
                    src={event.teams.away.badge}
                    alt={event.teams.away.name}
                    className="h-10 w-10 object-contain"
                  />
                )}
              </div>
            ) : (
              <span className="text-sm md:text-base font-body font-semibold text-foreground">
                {event.title}
              </span>
            )}
            {viewerStr && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{viewerStr}</span>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href={`/watch/sport/${event.id}`}>
              <Button
                variant="primary"
                size="lg"
                className="gap-2 font-semibold tracking-wider text-xs uppercase"
              >
                <Play className="h-4 w-4" fill="currentColor" />
                Watch Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
