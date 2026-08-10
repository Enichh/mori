"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface GenreFilter {
  id: number;
  name: string;
  slug: string;
}

// Common genre filters for sidebar
const movieGenres: GenreFilter[] = [
  { id: 28, name: "Action", slug: "action" },
  { id: 12, name: "Adventure", slug: "adventure" },
  { id: 16, name: "Animation", slug: "animation" },
  { id: 35, name: "Comedy", slug: "comedy" },
  { id: 80, name: "Crime", slug: "crime" },
  { id: 99, name: "Documentary", slug: "documentary" },
  { id: 18, name: "Drama", slug: "drama" },
  { id: 14, name: "Fantasy", slug: "fantasy" },
  { id: 27, name: "Horror", slug: "horror" },
  { id: 9648, name: "Mystery", slug: "mystery" },
  { id: 10749, name: "Romance", slug: "romance" },
  { id: 878, name: "Sci-Fi", slug: "sci-fi" },
  { id: 53, name: "Thriller", slug: "thriller" },
  { id: 10752, name: "War", slug: "war" },
];

interface SidebarProps {
  className?: string;
  onGenreSelect?: (genreId: number) => void;
  activeGenres?: number[];
}

export function Sidebar({
  className,
  onGenreSelect,
  activeGenres = [],
}: SidebarProps) {
  const pathname = usePathname();
  const isMovieRoute = pathname.startsWith("/movies");
  const isTVRoute = pathname.startsWith("/tv");

  return (
    <aside
      className={cn(
        "hidden lg:block w-56 shrink-0",
        "border-r border-border bg-background",
        className,
      )}
    >
      <div className="sticky top-20 p-4 space-y-6">
        {/* Quick Links */}
        <div>
          <h3 className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Browse
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/movies"
                className={cn(
                  "block px-3 py-2 text-sm font-body transition-colors",
                  isMovieRoute
                    ? "text-primary bg-primary/5 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                Movies
              </Link>
            </li>
            <li>
              <Link
                href="/tv"
                className={cn(
                  "block px-3 py-2 text-sm font-body transition-colors",
                  isTVRoute
                    ? "text-primary bg-primary/5 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                TV Shows
              </Link>
            </li>
            <li>
              <Link
                href="/anime"
                className={cn(
                  "block px-3 py-2 text-sm font-body transition-colors",
                  pathname.startsWith("/anime")
                    ? "text-primary bg-primary/5 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                ⚔️ Anime
              </Link>
            </li>
          </ul>
        </div>

        {/* Genre Filters */}
        <div>
          <h3 className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Genres
          </h3>
          <ul className="space-y-0.5">
            {movieGenres.map((genre) => {
              const isActive = activeGenres.includes(genre.id);
              return (
                <li key={genre.id}>
                  <button
                    onClick={() => onGenreSelect?.(genre.id)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-sm font-body transition-colors",
                      isActive
                        ? "text-primary bg-primary/5 border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {genre.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export { movieGenres };
