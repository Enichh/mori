"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenreFilterProps {
  genres: { id: number; name: string }[];
  activeGenre?: string;
  baseHref: string;
  currentSort?: string;
  /** Extra params to preserve when changing genre (e.g. country, media) */
  extraParams?: Record<string, string>;
}

export function GenreFilter({
  genres,
  activeGenre,
  baseHref,
  currentSort,
  extraParams,
}: GenreFilterProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeLabel = activeGenre
    ? genres.find((g) => String(g.id) === activeGenre)?.name || "Unknown"
    : "All Genres";

  const navigate = (genreId?: string) => {
    const params = new URLSearchParams();
    // Preserve extra params (country, media, etc.)
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        if (v) params.set(k, v);
      }
    }
    if (genreId) params.set("genre", genreId);
    if (currentSort && currentSort !== "popularity.desc")
      params.set("sort", currentSort);
    const qs = params.toString();
    router.push(`${baseHref}${qs ? `?${qs}` : ""}`);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-body font-medium transition-all duration-200",
          "bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
          open && "border-primary text-foreground",
        )}
      >
        {activeLabel}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-44 sm:w-48 max-h-60 sm:max-h-64 overflow-y-auto bg-card border border-border shadow-lg animate-fade-in">
          <button
            onClick={() => navigate()}
            className={cn(
              "w-full text-left px-3 py-2 text-xs font-body hover:bg-muted transition-colors",
              !activeGenre
                ? "text-primary bg-primary/5"
                : "text-muted-foreground",
            )}
          >
            All Genres
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => navigate(String(genre.id))}
              className={cn(
                "w-full text-left px-3 py-2 text-xs font-body hover:bg-muted transition-colors",
                activeGenre === String(genre.id)
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground",
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
