"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPosterUrl, getProfileUrl } from "@/lib/tmdb-image";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { SearchResult } from "@/types";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  className?: string;
}

function getDetailUrl(result: SearchResult): string {
  if (result.mediaType === "person") return "#";
  if (result.mediaType === "movie") return `/movies/${result.id}`;
  if (result.mediaType === "anime") return `/anime/${result.id}`;
  return `/tv/${result.id}`;
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const isPerson = result.mediaType === "person";
  const imageUrl = isPerson
    ? getProfileUrl(result.profilePath || null, "w185")
    : getPosterUrl(result.posterPath, "w342");
  const title = result.title || result.name || "Untitled";
  const year = result.releaseDate
    ? new Date(result.releaseDate).getFullYear()
    : result.firstAirDate
      ? new Date(result.firstAirDate).getFullYear()
      : null;
  const href = getDetailUrl(result);
  const rating = result.voteAverage
    ? Math.round(result.voteAverage * 10) / 10
    : null;

  return (
    <Link
      href={href}
      className="flex gap-4 p-3 bg-card border border-border hover:border-primary/20 hover:bg-card-hover transition-all duration-200 group"
    >
      {/* Image */}
      <div
        className={cn(
          "shrink-0 bg-muted overflow-hidden",
          isPerson ? "w-16 h-16 rounded-full" : "w-16 h-24",
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={isPerson ? 64 : 64}
            height={isPerson ? 64 : 96}
            className={cn(
              "object-cover w-full h-full",
              isPerson && "rounded-full",
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {isPerson ? (
              <User className="h-6 w-6" />
            ) : (
              <span className="text-[10px] font-mono">{result.mediaType}</span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-body font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          {rating !== null && !isPerson && (
            <span className="text-xs text-primary font-mono shrink-0">
              ★ {rating}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Badge variant="default" className="text-[10px] px-1.5 py-0">
            {result.mediaType}
          </Badge>
          {year && (
            <span className="text-xs text-muted-foreground font-mono">
              {year}
            </span>
          )}
        </div>

        {result.overview && (
          <p className="text-xs text-muted-foreground font-body line-clamp-2 mt-1.5 leading-relaxed">
            {result.overview}
          </p>
        )}
      </div>
    </Link>
  );
}

export function SearchResults({
  results,
  isLoading,
  query,
  className,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 text-center",
          className,
        )}
      >
        <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
        <h3 className="text-lg font-heading text-foreground mb-1">
          No results found
        </h3>
        <p className="text-sm text-muted-foreground font-body max-w-md">
          We couldn't find any results for &ldquo;{query}&rdquo;. Try different
          keywords or check the spelling.
        </p>
      </div>
    );
  }

  if (!query) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 text-center",
          className,
        )}
      >
        <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
        <h3 className="text-lg font-heading text-foreground mb-1">
          Start searching
        </h3>
        <p className="text-sm text-muted-foreground font-body">
          Type to search for movies, TV shows, and people.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-muted-foreground font-body">
        Found {results.length} result{results.length !== 1 ? "s" : ""} for
        &ldquo;{query}&rdquo;
      </p>
      <div className="space-y-2">
        {results.map((result) => (
          <SearchResultCard
            key={`${result.mediaType}-${result.id}`}
            result={result}
          />
        ))}
      </div>
    </div>
  );
}
