// ---------------------------------------------------------------------------
// Mori ― Sport Events service (cdnlivetv only)
// ---------------------------------------------------------------------------
import type { SportEvent, SportChannel, SportCategory } from "@/types/sports";
import { SportsClient } from "./client";
import type { CdnEventDTO, CdnResponse, CdnChannelDTO } from "./types";

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapCdnChannel(dto: CdnChannelDTO): SportChannel {
  return {
    channel_name: dto.channel_name,
    channel_code: dto.channel_code,
    url: dto.url,
    image: dto.image,
    viewers: dto.viewers,
  };
}

function mapCdnEvent(dto: CdnEventDTO, sport: string): SportEvent {
  // Resolve title: team-based vs event-based sports
  let title: string;
  if (dto.homeTeam && dto.awayTeam) {
    title = `${dto.homeTeam} vs ${dto.awayTeam}`;
  } else if (dto.event) {
    title = dto.event;
  } else {
    title = dto.tournament || "Unknown Event";
  }

  // Resolve date: prefer `start` field, fall back to `time`, then now
  let date: number;
  const parsed = new Date(dto.start).getTime();
  if (!isNaN(parsed)) {
    date = parsed;
  } else {
    const timeParsed = new Date(dto.time).getTime();
    date = !isNaN(timeParsed) ? timeParsed : Date.now();
  }

  // Resolve poster
  const poster = dto.homeTeamIMG ?? dto.awayTeamIMG ?? dto.eventIMG ?? null;

  // Sum viewer count from channels
  const viewerCount = dto.channels.reduce(
    (sum, ch) => sum + (ch.viewers || 0),
    0,
  );

  // Only set teams if at least one side has a name
  const hasTeams =
    (dto.homeTeam && dto.homeTeam.trim().length > 0) ||
    (dto.awayTeam && dto.awayTeam.trim().length > 0);

  return {
    id: dto.gameID,
    title,
    category: sport as SportCategory,
    date,
    poster,
    popular: false,
    teams: hasTeams
      ? {
          home: {
            name: dto.homeTeam || "",
            badge: dto.homeTeamIMG ?? null,
          },
          away: {
            name: dto.awayTeam || "",
            badge: dto.awayTeamIMG ?? null,
          },
        }
      : undefined,
    status: dto.status,
    tournament: dto.tournament,
    country: dto.country,
    countryIMG: dto.countryIMG,
    viewerCount,
    channels: dto.channels.map(mapCdnChannel),
  };
}

// ---------------------------------------------------------------------------
// Slug mapping: our SportCategory → cdnlivetv slug
// ---------------------------------------------------------------------------

const CDNLIVE_SPORT_MAP: Record<string, string> = {
  football: "soccer",
  basketball: "nba",
  "american-football": "nfl",
  hockey: "nhl",
  baseball: "mlb",
  fight: "ufc",
  "motor-sports": "motorsport",
  motorsport: "motorsport",
};

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface ISportEventsService {
  getLiveEvents(sport: string): Promise<SportEvent[]>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SportEventsService implements ISportEventsService {
  constructor(private readonly client: SportsClient) {}

  /**
   * Fetch live/upcoming/finished events for a sport from cdnlivetv.
   */
  async getLiveEvents(sport: string): Promise<SportEvent[]> {
    const cdnSport = CDNLIVE_SPORT_MAP[sport] ?? sport;
    const res = await this.client.get<CdnResponse>(
      `/events/sports/${cdnSport}`,
      { user: "cdnlivetv", plan: "free" },
      SportsClient.CDNLIVE_BASE,
    );
    if (!res.success || !res.data) {
      return [];
    }

    // Flatten the grouped events from cdnlivetv response
    const grouped = res.data["cdn-live-tv"];
    const events: SportEvent[] = [];
    const seen = new Set<string>();
    for (const key of Object.keys(grouped)) {
      const group = grouped[key];
      if (Array.isArray(group)) {
        for (const dto of group) {
          // Skip duplicates — the same event can appear in multiple groups
          if (seen.has(dto.gameID)) continue;
          if (!dto.channels?.length) continue; // skip events with no streams
          seen.add(dto.gameID);
          events.push(mapCdnEvent(dto, sport));
        }
      }
    }
    return events;
  }
}
