import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SortOption {
  value: string;
  label: string;
}

interface SelectSortProps {
  options: SortOption[];
  currentSort: string;
  baseHref: string;
  genre?: string;
  page?: string;
}

export function SelectSort({
  options,
  currentSort,
  baseHref,
  genre,
  page,
}: SelectSortProps) {
  const buildHref = (sort: string) => {
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (sort !== "popularity.desc") params.set("sort", sort);
    if (page && page !== "1") params.set("page", page);
    const qs = params.toString();
    return `${baseHref}${qs ? `?${qs}` : ""}`;
  };

  const currentLabel =
    options.find((o) => o.value === currentSort)?.label || "Sort";

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
        {currentLabel}
        <ChevronDown className="w-3 h-3" />
      </button>
      <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-md bg-card border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {options.map((option) => (
          <Link
            key={option.value}
            href={buildHref(option.value)}
            className={cn(
              "block px-4 py-2 text-xs hover:bg-card-hover transition-colors",
              option.value === currentSort
                ? "text-primary font-medium"
                : "text-muted-foreground",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
