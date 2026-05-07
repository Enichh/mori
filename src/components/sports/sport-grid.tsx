import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SportCard } from "@/components/sports/sport-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { SportEvent } from "@/types";

interface SportGridProps {
  title: string;
  items: SportEvent[];
  viewAllHref?: string;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function SportGrid({
  title,
  items,
  viewAllHref,
  isLoading = false,
  className,
  emptyMessage = "No matches found.",
}: SportGridProps) {
  return (
    <section className={cn("", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-heading-sm md:text-heading-md text-foreground">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-body"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground font-body text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item, index) => (
            <SportCard
              key={`${item.id}-${index}`}
              event={item}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </section>
  );
}
