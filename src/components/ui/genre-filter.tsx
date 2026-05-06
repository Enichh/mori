import Link from "next/link";
import { cn } from "@/lib/utils";

interface GenreFilterProps {
  genres: { id: number; name: string }[];
  activeGenre?: string;
  baseHref: string;
  currentSort?: string;
}

export function GenreFilter({
  genres,
  activeGenre,
  baseHref,
  currentSort,
}: GenreFilterProps) {
  const buildHref = (genreId?: string) => {
    const params = new URLSearchParams();
    if (genreId) params.set("genre", genreId);
    if (currentSort && currentSort !== "popularity.desc") params.set("sort", currentSort);
    const qs = params.toString();
    return `${baseHref}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <Link
        href={buildHref()}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors",
          !activeGenre
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground",
        )}
      >
        All
      </Link>
      {genres.slice(0, 20).map((genre) => (
        <Link
          key={genre.id}
          href={buildHref(String(genre.id))}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors",
            activeGenre === String(genre.id)
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground",
          )}
        >
          {genre.name}
        </Link>
      ))}
    </div>
  );
}
