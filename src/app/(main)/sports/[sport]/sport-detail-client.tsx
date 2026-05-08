"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { SportGrid } from "@/components/sports/sport-grid";
import type { SportEvent } from "@/types";

// ---------------------------------------------------------------------------
// Constants (mirrored from sports-client.tsx for zero-dependency operation)
// ---------------------------------------------------------------------------

// Use Netlify CDN proxy in production, direct URL in dev (no proxy available)
const CDNLIVE_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "https://api.cdnlivetv.ru/api/v1"
    : "/api/sports";

const CDNLIVE_SPORT_MAP: Record<string, string> = {
  basketball: "nba",
  football: "soccer",
  baseball: "mlb",
  hockey: "nhl",
  fight: "ufc",
  motorsport: "motorsport",
};

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

const CACHE_TTL = 300000; // 5 minutes for live sports

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
// Mapper
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

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

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
// Cache helpers
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: SportEvent[];
  timestamp: number;
}

function getCacheKey(sport: string): string {
  return `mori:cache:sports:${sport}`;
}

function readCache(key: string): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp < CACHE_TTL) return entry;
  } catch {
    // corrupted cache
  }
  return null;
}

function writeCache(key: string, data: SportEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SportDetailClientProps {
  sport: string;
}

export function SportDetailClient({ sport }: SportDetailClientProps) {
  const displayName =
    sport.charAt(0).toUpperCase() + sport.slice(1).replace(/-/g, " ");

  // ---- Invalid sport ----
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

  const cacheKey = getCacheKey(sport);
  const [events, setEvents] = React.useState<SportEvent[]>(() => {
    const cached = readCache(cacheKey);
    return cached?.data ?? [];
  });
  const [loading, setLoading] = React.useState(!events.length);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      // Check cache first
      const cached = readCache(cacheKey);
      if (cached?.data && !cancelled) {
        setEvents(cached.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const raw = await fetchSportEvents(sport);
        if (cancelled) return;

        // Sort: live first, then upcoming, then finished
        const order = { live: 0, upcoming: 1, finished: 2 } as const;
        const sorted = raw.sort(
          (a, b) =>
            (order[a.status ?? "finished"] ?? 2) -
            (order[b.status ?? "finished"] ?? 2),
        );

        setEvents(sorted);
        writeCache(cacheKey, sorted);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load events",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, sport]);

  // ---- Loading ----
  if (loading && events.length === 0) {
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error && events.length === 0) {
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
        </div>
        <div className="py-20 text-center">
          <p className="text-destructive mb-2">Failed to load events</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Link
            href="/sports"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Sports
          </Link>
        </div>
      </div>
    );
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
