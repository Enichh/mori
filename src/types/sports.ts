// ---------------------------------------------------------------------------
// Mori ― Sport domain type definitions
// ---------------------------------------------------------------------------

export type SportCategory =
  | "basketball"
  | "football"
  | "baseball"
  | "hockey"
  | "american-football"
  | "fight"
  | "tennis"
  | "golf"
  | "cricket"
  | "rugby"
  | "motorsport"
  | "motor-sports"
  | "afl"
  | "darts"
  | "billiards"
  | "other";

export type SportEventStatus = "live" | "upcoming" | "finished";

export interface Team {
  name: string;
  badge: string | null;
}

export interface SportEvent {
  id: string;
  title: string;
  category: SportCategory;
  date: number; // timestamp ms
  poster: string | null;
  popular: boolean;
  teams?: {
    home: Team;
    away: Team;
  };
  // Extended fields from cdnlivetv API:
  status?: SportEventStatus;
  tournament?: string;
  country?: string;
  countryIMG?: string | null;
  viewerCount?: number;
  channels?: SportChannel[];
}

export interface SportChannel {
  channel_name: string;
  channel_code: string;
  url: string;
  image: string | null;
  viewers: number;
}
