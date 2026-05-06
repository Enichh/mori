import * as React from "react";
import { cn } from "@/lib/utils";

// --- Skeleton ---

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "poster";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse bg-muted rounded-none",
        variant === "text" && "h-4 w-full",
        variant === "circular" && "h-10 w-10 rounded-full",
        variant === "poster" && "aspect-[2/3] w-full",
        className,
      )}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

// --- SkeletonCard (for media cards) ---

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton variant="poster" />
      <div className="space-y-2 px-1">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
}

// --- SkeletonHero ---

function SkeletonHero() {
  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[#0A0A0A] animate-pulse" />
  );
}

export { Skeleton, SkeletonCard, SkeletonHero };
