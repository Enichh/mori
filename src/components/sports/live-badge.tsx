"use client";

import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  status?: "live" | "upcoming" | "finished";
  className?: string;
}

export function LiveBadge({ status, className }: LiveBadgeProps) {
  if (status === "live") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold bg-red-600 text-white animate-pulse",
          className,
        )}
      >
        LIVE
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-600/20 text-yellow-500 border border-yellow-600/30",
          className,
        )}
      >
        Upcoming
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs text-muted-foreground bg-muted",
          className,
        )}
      >
        Finished
      </span>
    );
  }
  return null;
}
