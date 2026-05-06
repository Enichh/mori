import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaCard } from "@/components/media/media-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { BaseMedia, MediaType } from "@/types";

interface MediaGridProps {
  title: string;
  items: BaseMedia[];
  mediaType: MediaType;
  viewAllHref?: string;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function MediaGrid({
  title,
  items,
  mediaType,
  viewAllHref,
  isLoading = false,
  className,
  emptyMessage = "No titles found.",
}: MediaGridProps) {
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
            <MediaCard
              key={item.id}
              media={item}
              mediaType={mediaType}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </section>
  );
}
