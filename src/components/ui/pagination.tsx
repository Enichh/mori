import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseHref: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  baseHref,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return `${baseHref}${qs ? `?${qs}` : ""}`;
  };

  const pages: (number | "...")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1 py-8" aria-label="Pagination">
      <Link
        href={buildHref(currentPage - 1)}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors",
          currentPage <= 1 && "pointer-events-none opacity-40",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex items-center justify-center w-10 h-10 text-muted-foreground text-sm"
          >
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page as number)}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-md text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ),
      )}

      <Link
        href={buildHref(currentPage + 1)}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors",
          currentPage >= totalPages && "pointer-events-none opacity-40",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}
