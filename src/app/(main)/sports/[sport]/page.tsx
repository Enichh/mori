import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SportsService } from "@/services/sports";
import { SportGrid } from "@/components/sports/sport-grid";
import type { SportEvent } from "@/types";

export const revalidate = 3600; // 30 min

const VALID_SPORTS = new Set([
  "basketball",
  "football",
  "baseball",
  "hockey",
  "american-football",
  "fight",
  "tennis",
  "golf",
  "cricket",
  "rugby",
  "motorsport",
  "motor-sports",
  "afl",
  "darts",
  "billiards",
  "other",
]);

interface SportPageProps {
  params: Promise<{ sport: string }>;
}

export async function generateMetadata({
  params,
}: SportPageProps): Promise<Metadata> {
  const { sport } = await params;
  const displayName =
    sport.charAt(0).toUpperCase() + sport.slice(1).replace(/-/g, " ");
  return {
    title: `${displayName} | Mori`,
    description: `Stream live ${displayName} matches and events.`,
  };
}

export default async function SportPage({ params }: SportPageProps) {
  const { sport } = await params;
  const displayName =
    sport.charAt(0).toUpperCase() + sport.slice(1).replace(/-/g, " ");

  // Validate sport slug
  if (!VALID_SPORTS.has(sport)) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Unknown Sport
        </h1>
        <p className="text-muted-foreground mb-6">
          &quot;{sport}&quot; is not a recognized sport category.
        </p>
        <Link
          href="/sports"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Sports
        </Link>
      </div>
    );
  }

  const sports = SportsService.getInstance();

  // Fetch live events from cdnlivetv
  let events: SportEvent[] = [];
  try {
    const raw = await sports.events.getLiveEvents(sport);
    // Sort: live first, then upcoming, then finished
    const order = { live: 0, upcoming: 1, finished: 2 } as const;
    events = raw.sort(
      (a, b) =>
        (order[a.status ?? "finished"] ?? 2) -
        (order[b.status ?? "finished"] ?? 2),
    );
  } catch {
    events = [];
  }

  return (
    <div className="container-cine py-8">
      <Link
        href="/sports"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Sports
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Stream live {displayName.toLowerCase()} matches and events.
        </p>
      </div>
      {events.length > 0 ? (
        <SportGrid
          title=""
          items={events}
          emptyMessage={`No ${displayName.toLowerCase()} matches available right now.`}
        />
      ) : (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            No {displayName.toLowerCase()} matches available right now.
          </p>
          <Link
            href="/sports"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Sports
          </Link>
        </div>
      )}
    </div>
  );
}
