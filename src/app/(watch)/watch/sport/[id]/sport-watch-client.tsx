"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  AlertTriangle,
  Tv,
  Radio,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { SportChannel } from "@/types";
import { openSmartlink } from "@/lib/smartlink";

// ---------------------------------------------------------------------------
// Constants (mirrored from server — no Netlify function needed)
// ---------------------------------------------------------------------------

const CDNLIVE_BASE = "/api/sports";

const CDNLIVE_SPORT_MAP: Record<string, string> = {
  basketball: "nba",
  football: "soccer",
  "american-football": "nfl",
  hockey: "nhl",
  baseball: "mlb",
  fight: "ufc",
  "motor-sports": "motorsport",
  motorsport: "motorsport",
};

// ---------------------------------------------------------------------------
// Helpers
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

function guessSportFromId(id: string): string | null {
  const lower = id.toLowerCase();
  if (lower.includes("basketball") || lower.includes("nba"))
    return "basketball";
  if (lower.includes("football") || lower.includes("soccer")) return "football";
  if (lower.includes("baseball") || lower.includes("mlb")) return "baseball";
  if (lower.includes("hockey") || lower.includes("nhl")) return "hockey";
  if (lower.includes("american-football") || lower.includes("nfl"))
    return "american-football";
  if (
    lower.includes("fight") ||
    lower.includes("ufc") ||
    lower.includes("boxing") ||
    lower.includes("wwe") ||
    lower.includes("mma")
  )
    return "fight";
  if (lower.includes("tennis")) return "tennis";
  if (lower.includes("golf")) return "golf";
  if (lower.includes("cricket")) return "cricket";
  if (lower.includes("rugby")) return "rugby";
  if (
    lower.includes("motor") ||
    lower.includes("f1") ||
    lower.includes("nascar") ||
    lower.includes("moto")
  )
    return "motor-sports";
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SportWatchClientProps {
  gameId?: string;
}

export function SportWatchClient({
  gameId: propGameId,
}: SportWatchClientProps) {
  const params = useParams();
  const gameId = (propGameId ?? params?.id ?? "") as string;
  const [channels, setChannels] = React.useState<SportChannel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchChannels() {
      try {
        setLoading(true);
        setError(null);

        const sportGuess = guessSportFromId(gameId);
        if (!sportGuess) {
          if (!cancelled) {
            setError("Could not determine sport type from event ID.");
            setLoading(false);
          }
          return;
        }

        const cdnSport = CDNLIVE_SPORT_MAP[sportGuess] ?? sportGuess;
        const res = await fetch(
          `${CDNLIVE_BASE}/events/sports/${cdnSport}?user=cdnlivetv&plan=free`,
        );

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        const grouped = data["cdn-live-tv"];
        if (!grouped) {
          if (!cancelled) setChannels([]);
          return;
        }

        const found: SportChannel[] = [];
        const seen = new Set<string>();
        for (const key of Object.keys(grouped)) {
          const group = grouped[key];
          if (Array.isArray(group)) {
            for (const dto of group as CdnEventDTO[]) {
              if (dto.gameID === gameId) {
                for (const ch of dto.channels) {
                  const channelKey = ch.channel_code + ch.channel_name;
                  if (!seen.has(channelKey)) {
                    seen.add(channelKey);
                    found.push({
                      channel_name: ch.channel_name,
                      channel_code: ch.channel_code,
                      url: ch.url,
                      image: ch.image ?? null,
                      viewers: ch.viewers ?? 0,
                    });
                  }
                }
              }
            }
          }
        }

        if (!cancelled) {
          setChannels(found);
          if (found.length === 0) {
            setError(
              "No streams found for this event. The match may not have started yet or is no longer available.",
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load streams",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChannels();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">
            Loading stream...
          </p>
        </div>
      </div>
    );
  }

  // ---- Error / no channels ----
  if (error && channels.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="container-cine text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
            <AlertTriangle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
            Stream Unavailable
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sports"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Sports
            </Link>
            <button
              onClick={openSmartlink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 font-semibold text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Watch on external player
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryChannel = channels[0] ?? null;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-gradient-to-b from-black/90 to-transparent flex items-center px-4">
        <Link
          href="/sports"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors font-body"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Sports</span>
        </Link>
      </div>

      {/* Video player */}
      <section className="w-full bg-black flex-1 flex flex-col">
        <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
          <div className="relative w-full aspect-video bg-black">
            {primaryChannel ? (
              <iframe
                src={primaryChannel.url}
                title={`${primaryChannel.channel_name} Stream`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No playable stream available.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-card border-t border-border py-4">
        <div className="container-cine">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-heading font-bold text-foreground">
                {primaryChannel
                  ? `${primaryChannel.channel_name}`
                  : "Live Sports Event"}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                ID: {gameId}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {channels.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>
                    {primaryChannel?.channel_name}
                    {primaryChannel?.viewers
                      ? ` (${primaryChannel.viewers} watching)`
                      : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {channels.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {channels.map((ch) => (
                <a
                  key={ch.channel_code + ch.channel_name}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    ch === primaryChannel
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
                  }`}
                >
                  {ch.channel_name}
                  {ch.viewers > 0 && (
                    <span className="text-[10px] opacity-70">
                      ({ch.viewers})
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
