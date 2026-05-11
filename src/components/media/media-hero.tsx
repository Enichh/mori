"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBackdropUrl } from "@/lib/tmdb-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonHero } from "@/components/ui/skeleton";
import type { Movie, TVShow, Anime, MediaType } from "@/types";

interface MediaHeroProps {
  media?: Movie | TVShow | Anime | null;
  mediaType: MediaType;
  isLoading?: boolean;
  className?: string;
}

function getTitle(media: Movie | TVShow | Anime): string {
  return (media as Movie).title || (media as TVShow).name || "Untitled";
}

function getYear(media: Movie | TVShow | Anime): string | null {
  const date = (media as Movie).releaseDate || (media as TVShow).firstAirDate;
  return date ? new Date(date).getFullYear().toString() : null;
}

export function MediaHero({
  media,
  mediaType,
  isLoading = false,
  className,
}: MediaHeroProps) {
  if (isLoading || !media) {
    return <SkeletonHero />;
  }

  const backdropUrl = getBackdropUrl(media.backdropPath, "w780");
  const title = getTitle(media);
  const year = getYear(media);
  const rating = media.voteAverage
    ? Math.round(media.voteAverage * 10) / 10
    : null;
  const genres = media.genres?.slice(0, 3) || [];
  const overview = media.overview || "";

  const detailHref =
    mediaType === "movie"
      ? `/movies/${media.id}`
      : mediaType === "tv"
        ? `/tv/${media.id}`
        : `/anime/${media.id}`;

  const watchHref =
    mediaType === "movie"
      ? `/watch/movie/${media.id}`
      : mediaType === "tv"
        ? `/watch/tv/${media.id}`
        : `/watch/anime/${media.id}`;

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
            suppressHydrationWarning
          />
        )}

        {/* Radial glow overlay */}
        <div className="absolute inset-0 gradient-radial-hero" />

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12 max-w-3xl z-10">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {year && (
              <span className="text-xs text-muted-foreground font-mono tracking-widest">
                {year}
              </span>
            )}
            {rating !== null && (
              <Badge
                variant="primary"
                className="flex items-center gap-1.5 px-3 py-1"
              >
                <Star className="h-3 w-3" fill="currentColor" />
                <span className="font-semibold">{rating}</span>
              </Badge>
            )}
            {genres.map((genre) => (
              <Badge
                key={genre.id}
                variant="outline"
                className="text-[10px] tracking-wider"
              >
                {genre.name}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-heading font-normal italic text-display-sm md:text-display-md lg:text-display-lg text-foreground mb-4 leading-[0.95] tracking-[-0.02em] text-balance">
            {title.split(" ").map((word, i, arr) => {
              // Emphasize every 3rd word in lime green (zkPass style)
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

          {/* Overview */}
          {overview && (
            <p className="text-sm md:text-base text-[rgb(197,197,197)] font-body leading-relaxed line-clamp-3 mb-6 max-w-2xl">
              {overview}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href={watchHref}>
              <Button
                variant="primary"
                size="lg"
                className="gap-2 font-semibold tracking-wider text-xs uppercase"
              >
                <Play className="h-4 w-4" fill="currentColor" />
                Watch Now
              </Button>
            </Link>
            <Link href={detailHref}>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 font-medium tracking-wider text-xs uppercase"
              >
                <Info className="h-4 w-4" />
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
