"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star, Film, Tv, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPosterUrl } from "@/lib/tmdb-image";
import { Badge } from "@/components/ui/badge";
import type { BaseMedia, MediaType } from "@/types";

interface MediaCardProps {
  media: BaseMedia;
  mediaType: MediaType;
  priority?: boolean;
  className?: string;
}

const mediaTypeIcons: Record<MediaType, React.FC<{ className?: string }>> = {
  movie: Film,
  tv: Tv,
  anime: Swords,
};

const mediaTypeLabels: Record<MediaType, string> = {
  movie: "Movie",
  tv: "TV",
  anime: "Anime",
};

const detailPath: Record<MediaType, string> = {
  movie: "/movies",
  tv: "/tv",
  anime: "/anime",
};

export function MediaCard({
  media,
  mediaType,
  priority = false,
  className,
}: MediaCardProps) {
  const posterUrl = getPosterUrl(media.posterPath, "w500");
  const title =
    "title" in media
      ? (media as any).title
      : "name" in media
        ? (media as any).name
        : "Untitled";
  const year =
    "releaseDate" in media && (media as any).releaseDate
      ? new Date((media as any).releaseDate).getFullYear()
      : "firstAirDate" in media && (media as any).firstAirDate
        ? new Date((media as any).firstAirDate).getFullYear()
        : null;
  const rating = media.voteAverage
    ? Math.round(media.voteAverage * 10) / 10
    : null;
  const TypeIcon = mediaTypeIcons[mediaType];

  return (
    <Link
      href={`${detailPath[mediaType]}/${media.id}`}
      className={cn("group block", className)}
    >
      <div className="relative overflow-hidden bg-muted aspect-[2/3]">
        {/* Poster Image */}
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <TypeIcon className="h-12 w-12 mb-2 opacity-30" />
            <span className="text-xs font-mono">
              {mediaTypeLabels[mediaType]}
            </span>
          </div>
        )}

        {/* Hover overlay with play button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm">
            <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
          </div>
        </div>

        {/* Rating badge (top-right) */}
        {rating !== null && (
          <Badge
            variant="primary"
            className="absolute top-2 right-2 flex items-center gap-1 text-xs"
          >
            <Star className="h-3 w-3" fill="currentColor" />
            {rating}
          </Badge>
        )}

        {/* Media type badge (top-left) */}
        <Badge
          variant="default"
          className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 border-none text-xs"
        >
          <TypeIcon className="h-3 w-3" />
          {mediaTypeLabels[mediaType]}
        </Badge>
      </div>

      {/* Info below poster */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-body font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {year}
          </p>
        )}
      </div>
    </Link>
  );
}
