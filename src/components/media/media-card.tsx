"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Film, Tv, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPosterUrl } from "@/lib/tmdb-image";
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
  const TypeIcon = mediaTypeIcons[mediaType];

  return (
    <Link
      href={`${detailPath[mediaType]}/${media.id}`}
      className={cn("group block", className)}
    >
      <div className="relative overflow-hidden bg-muted aspect-[2/3]">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <TypeIcon className="h-10 w-10 mb-1 opacity-25" />
            <span className="text-[10px] font-mono opacity-40">
              {mediaTypeLabels[mediaType]}
            </span>
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
        <h3 className="text-xs sm:text-sm font-body font-medium text-foreground line-clamp-1 break-words group-hover:text-primary transition-colors">
          {title}
        </h3>
        {year && (
          <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-0.5">
            {year}
          </p>
        )}
      </div>
    </Link>
  );
}
