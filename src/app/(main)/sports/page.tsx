import type { Metadata } from "next";
import { SportsService } from "@/services/sports";
import { SportHero } from "@/components/sports/sport-hero";
import { SportFilter } from "@/components/sports/sport-filter";
import type { SportEvent } from "@/types";

export const revalidate = 7200; // 2 hours

export const metadata: Metadata = {
  title: "Live Sports | Mori",
  description:
    "Stream live sports from around the world — basketball, football, baseball, hockey, MMA, tennis, golf, cricket, and more.",
};

// All sports the cdnlivetv API actually supports
const ALL_SPORTS = [
  "basketball",
  "football",
  "baseball",
  "hockey",
  "fight",
  "tennis",
  "golf",
  "cricket",
  "darts",
  "motorsport",
] as const;

const SPORT_LABELS: Record<string, string> = {
  basketball: "NBA",
  football: "Football",
  baseball: "MLB",
  hockey: "NHL",
  fight: "UFC / MMA",
  tennis: "Tennis",
  golf: "Golf",
  cricket: "Cricket",
  darts: "Darts",
  motorsport: "F1 / Moto",
};

export default async function SportsPage() {
  const sportsService = SportsService.getInstance();

  // Fetch live events from cdnlivetv for ALL sports
  const results = await Promise.allSettled(
    ALL_SPORTS.map((sport) => sportsService.events.getLiveEvents(sport)),
  );

  // Build sport → events map
  const allEvents: SportEvent[] = [];
  const sportCounts: Record<string, number> = {};
  const errors: string[] = [];

  ALL_SPORTS.forEach((sport, i) => {
    const result = results[i];
    if (result.status === "fulfilled" && result.value.length > 0) {
      // Sort: live first, then upcoming, then finished
      const order = { live: 0, upcoming: 1, finished: 2 } as const;
      const sorted = result.value.sort(
        (a, b) =>
          (order[a.status ?? "finished"] ?? 2) -
          (order[b.status ?? "finished"] ?? 2),
      );
      // Tag each event with its sport category so the filter can work
      for (const evt of sorted) {
        evt.category = sport as SportEvent["category"];
        allEvents.push(evt);
      }
      sportCounts[sport] = sorted.length;
    } else if (result.status === "rejected") {
      errors.push(`${sport}: ${result.reason}`);
    }
  });

  // Find a featured live event (prefer basketball or football)
  const featured =
    allEvents.find(
      (e) =>
        e.status === "live" &&
        (e.category === "basketball" || e.category === "football"),
    ) ??
    allEvents.find((e) => e.status === "live") ??
    allEvents[0] ??
    null;

  const liveCount = allEvents.filter((e) => e.status === "live").length;

  return (
    <div>
      {/* ---- Hero Section ---- */}
      {featured ? (
        <SportHero event={featured} />
      ) : (
        <section className="min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card">
          <div className="container-cine text-center py-16">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Live Sports
            </h1>
            <p className="text-muted-foreground mt-2">
              Stream live sports from around the world.
            </p>
          </div>
        </section>
      )}

      {/* ---- Marquee Ticker ---- */}
      <section className="marquee-ticker">
        <div className="marquee-ticker-content">
          {ALL_SPORTS.map((sport, i) => (
            <span key={sport} className="inline-flex items-center gap-7 pr-7">
              <span className="text-[11px] tracking-[0.18em] text-primary uppercase font-body">
                {SPORT_LABELS[sport] ?? sport}
              </span>
              <span className="text-[rgb(61,61,61)] text-xs">
                {sportCounts[sport] ?? 0} events
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ---- Live-status banner ---- */}
      <div className="container-cine pt-8 pb-2">
        {liveCount > 0 ? (
          <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-red-600/10 border border-red-600/25">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-red-400">
              {liveCount} {liveCount === 1 ? "game" : "games"} live now
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-muted/60 border border-border">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/50" />
            </span>
            <span className="text-sm text-muted-foreground">
              No live events right now · Showing upcoming &amp; recent
            </span>
          </div>
        )}
      </div>

      {/* ---- Sport Filter + Grid ---- */}
      <div className="container-cine pt-6 pb-10">
        <SportFilter
          sports={ALL_SPORTS as readonly string[]}
          labels={SPORT_LABELS}
          counts={sportCounts}
          allEvents={allEvents}
        />
      </div>

      {/* ---- Footer ASCII Art ---- */}
      <section className="py-12">
        <div className="container-cine">
          <div className="terminal-box text-center">
            <pre className="ascii-art text-primary/25 pointer-events-none">
              {`  ╔══════════════════════════════════════════════╗
  ║    ███╗   ███╗ ██████╗ ██████╗ ██╗          ║
  ║    ████╗ ████║██╔═══██╗██╔══██╗██║          ║
  ║    ██╔████╔██║██║   ██║██████╔╝██║          ║
  ║    ██║╚██╔╝██║██║   ██║██╔══██╗██║          ║
  ║    ██║ ╚═╝ ██║╚██████╔╝██║  ██║██║          ║
  ║    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝          ║
  ║      cdnlivetv · Live Sports · Mori          ║
  ╚══════════════════════════════════════════════╝`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
