"use client";

import * as React from "react";
import { SportHero } from "@/components/sports/sport-hero";
import { SportFilter } from "@/components/sports/sport-filter";
import { Loader2 } from "lucide-react";
import type { SportEvent } from "@/types";

// ---------------------------------------------------------------------------
// Constants (browser fetches cdnlivetv directly — zero Netlify invocations)
// ---------------------------------------------------------------------------

const CDNLIVE_BASE = "/api/sports";

const CDNLIVE_SPORT_MAP: Record<string, string> = {
  basketball: "nba",
  football: "soccer",
  baseball: "mlb",
  hockey: "nhl",
  fight: "ufc",
  motorsport: "motorsport",
};

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

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

interface CdnChannelDTO {
  channel_name: string;
  channel_code: string;
  url: string;
  image?: string;
  viewers: number;
}

interface CdnEventDTO {
  gameID: string;
  homeTeam?: string;
  awayTeam?: string;
  event?: string;
  tournament?: string;
  status: string;
  start: string;
  time: string;
  homeTeamIMG?: string;
  awayTeamIMG?: string;
  eventIMG?: string;
  country?: string;
  countryIMG?: string;
  channels: CdnChannelDTO[];
}

// ---------------------------------------------------------------------------
// Mapper (duplicated from server — runs in browser now)
// ---------------------------------------------------------------------------

function mapCdnEvent(dto: CdnEventDTO, sport: string): SportEvent {
  let title: string;
  if (dto.homeTeam && dto.awayTeam) {
    title = `${dto.homeTeam} vs ${dto.awayTeam}`;
  } else if (dto.event) {
    title = dto.event;
  } else {
    title = dto.tournament || "Unknown Event";
  }

  let date: number;
  const parsed = new Date(dto.start).getTime();
  if (!isNaN(parsed)) {
    date = parsed;
  } else {
    const timeParsed = new Date(dto.time).getTime();
    date = !isNaN(timeParsed) ? timeParsed : Date.now();
  }

  const poster = dto.homeTeamIMG ?? dto.awayTeamIMG ?? dto.eventIMG ?? null;
  const viewerCount = dto.channels.reduce(
    (sum, ch) => sum + (ch.viewers || 0),
    0,
  );
  const hasTeams =
    (dto.homeTeam && dto.homeTeam.trim().length > 0) ||
    (dto.awayTeam && dto.awayTeam.trim().length > 0);

  return {
    id: dto.gameID,
    title,
    category: sport as SportEvent["category"],
    date,
    poster,
    popular: false,
    teams: hasTeams
      ? {
          home: { name: dto.homeTeam || "", badge: dto.homeTeamIMG ?? null },
          away: { name: dto.awayTeam || "", badge: dto.awayTeamIMG ?? null },
        }
      : undefined,
    status: (dto.status as SportEvent["status"]) ?? "finished",
    tournament: dto.tournament,
    country: dto.country,
    countryIMG: dto.countryIMG,
    viewerCount,
    channels: dto.channels.map((ch) => ({
      channel_name: ch.channel_name,
      channel_code: ch.channel_code,
      url: ch.url,
      image: ch.image ?? null,
      viewers: ch.viewers ?? 0,
    })),
  };
}

async function fetchSportEvents(sport: string): Promise<SportEvent[]> {
  const cdnSport = CDNLIVE_SPORT_MAP[sport] ?? sport;
  const res = await fetch(
    `${CDNLIVE_BASE}/events/sports/${cdnSport}?user=cdnlivetv&plan=free`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  const grouped = data["cdn-live-tv"];
  if (!grouped) return [];

  const events: SportEvent[] = [];
  const seen = new Set<string>();
  for (const key of Object.keys(grouped)) {
    const group = grouped[key];
    if (Array.isArray(group)) {
      for (const dto of group as CdnEventDTO[]) {
        if (seen.has(dto.gameID)) continue;
        seen.add(dto.gameID);
        events.push(mapCdnEvent(dto, sport));
      }
    }
  }
  return events;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SportsClient() {
  const [allEvents, setAllEvents] = React.useState<SportEvent[]>([]);
  const [sportCounts, setSportCounts] = React.useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.allSettled(
          ALL_SPORTS.map((sport) => fetchSportEvents(sport)),
        );

        if (cancelled) return;

        const events: SportEvent[] = [];
        const counts: Record<string, number> = {};

        const order = { live: 0, upcoming: 1, finished: 2 } as const;

        ALL_SPORTS.forEach((sport, i) => {
          const result = results[i];
          if (result.status === "fulfilled" && result.value.length > 0) {
            const sorted = result.value.sort(
              (a, b) =>
                (order[a.status ?? "finished"] ?? 2) -
                (order[b.status ?? "finished"] ?? 2),
            );
            for (const evt of sorted) {
              evt.category = sport as SportEvent["category"];
              events.push(evt);
            }
            counts[sport] = sorted.length;
          }
        });

        setAllEvents(events);
        setSportCounts(counts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load sports",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

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

  // ---- Loading ----
  if (loading) {
    return (
      <div>
        <section className="min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card">
          <div className="container-cine text-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Live Sports
            </h1>
            <p className="text-muted-foreground mt-2">Loading events...</p>
          </div>
        </section>
      </div>
    );
  }

  // ---- Error ----
  if (error && allEvents.length === 0) {
    return (
      <div>
        <section className="min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card">
          <div className="container-cine text-center py-16">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Live Sports
            </h1>
            <p className="text-muted-foreground mt-2">
              Unable to load events. Please try again later.
            </p>
          </div>
        </section>
      </div>
    );
  }

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
          {ALL_SPORTS.map((sport) => (
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
