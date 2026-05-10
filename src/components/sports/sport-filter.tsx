"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SportGrid } from "@/components/sports/sport-grid";
import type { SportEvent } from "@/types";

interface SportFilterProps {
  sports: readonly string[];
  labels: Record<string, string>;
  counts: Record<string, number>;
  allEvents: SportEvent[];
  className?: string;
}

export function SportFilter({
  sports,
  labels,
  counts,
  allEvents,
  className,
}: SportFilterProps) {
  const [active, setActive] = React.useState<string>("all");

  const filtered =
    active === "all"
      ? allEvents
      : allEvents.filter((e) => e.category === active);

  return (
    <div className={cn("", className)}>
      {/* Filter pills */}
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 pb-3 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActive("all")}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border",
            active === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40",
          )}
        >
          All ({allEvents.length})
        </button>
        {sports.map((sport) => {
          const count = counts[sport] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={sport}
              onClick={() => setActive(sport)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border",
                active === sport
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40",
              )}
            >
              {labels[sport] ?? sport} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <SportGrid
          title=""
          items={filtered}
          emptyMessage="No events match this sport right now."
        />
      ) : (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          No events for this sport right now. Check back later.
        </div>
      )}
    </div>
  );
}
