// ---------------------------------------------------------------------------
// Mori ― Sports raw API response shapes (internal)
// ---------------------------------------------------------------------------
// These DTOs mirror the actual JSON returned by cdnlivetv.
// They are *not* exported from the service facade – only the normalised
// domain types from `@/types/*` ever leave this layer.
// ---------------------------------------------------------------------------

// ---- cdnlivetv API raw shapes --------------------------------------------

export interface CdnChannelDTO {
  channel_name: string;
  channel_code: string;
  url: string;
  image: string | null;
  viewers: number;
}

export interface CdnEventDTO {
  gameID: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamIMG?: string;
  awayTeamIMG?: string;
  event?: string; // event-based sports
  eventIMG?: string; // event-based sports
  time: string;
  tournament: string;
  country: string;
  countryIMG: string;
  status: "live" | "upcoming" | "finished";
  start: string;
  end: string;
  channels: CdnChannelDTO[];
}

export interface CdnResponse {
  "cdn-live-tv": Record<string, CdnEventDTO[]>;
  total_events: number;
  cached: boolean;
  timestamp: number;
}
