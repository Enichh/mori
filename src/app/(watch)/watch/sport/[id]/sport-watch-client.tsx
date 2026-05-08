"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronLeft, AlertTriangle, Tv, Radio, Loader2 } from "lucide-react";
import type { SportChannel } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Always use the direct API — it's in CSP connect-src, avoids Netlify proxy issues.
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
  tennis: "tennis",
  golf: "golf",
  cricket: "cricket",
};

// All sports to try if we can't guess from the ID
const ALL_CDN_SPORTS = Object.keys(CDNLIVE_SPORT_MAP);

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
  // These IDs are opaque — they don't contain sport names.
  // The reference site (streamsports99.su) uses URL prefix like /player/motorsport-32xYWr9s
  // but we don't have that prefix. So we try all sports.
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
  const pathname = usePathname();

  // Static export: useParams() returns the pre-rendered "placeholder" param.
  // Extract the real ID from the URL pathname instead.
  const pathId = pathname ? pathname.split("/").filter(Boolean).pop() : null;
  const gameId = (propGameId ?? pathId ?? params?.id ?? "") as string;
  const [channels, setChannels] = React.useState<SportChannel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchChannels() {
      console.group("🏀 SportWatchClient — fetchChannels");
      console.log("gameId:", gameId);
      console.log("sports to try:", ALL_CDN_SPORTS);

      try {
        setLoading(true);
        setError(null);

        let found: SportChannel[] = [];
        const seen = new Set<string>();

        for (const sport of ALL_CDN_SPORTS) {
          if (cancelled) break;

          const cdnSport = CDNLIVE_SPORT_MAP[sport] ?? sport;
          const url = `${CDNLIVE_BASE}/events/sports/${cdnSport}?user=cdnlivetv&plan=free`;

          console.log(`→ Fetching ${sport} (cdn: ${cdnSport})`);
          console.log(`  URL: ${url}`);

          let res: Response;
          try {
            res = await fetch(url);
          } catch (fetchErr: any) {
            console.warn(
              `  ❌ Network error for ${sport}:`,
              fetchErr.message || fetchErr,
            );
            continue;
          }

          console.log(`  Response status: ${res.status} ${res.statusText}`);
          console.log(`  Content-Type: ${res.headers.get("content-type")}`);

          if (!res.ok) {
            console.warn(`  ⚠️ Non-OK status for ${sport}, skipping`);
            try {
              const snippet = await res.text();
              console.log(
                `  Body preview (first 300 chars):`,
                snippet.slice(0, 300),
              );
            } catch {}
            continue;
          }

          let data: any;
          try {
            data = await res.json();
            console.log(`  ✅ JSON parsed. Keys:`, Object.keys(data ?? {}));
          } catch (jsonErr: any) {
            console.warn(
              `  ❌ JSON parse failed for ${sport}:`,
              jsonErr.message || jsonErr,
            );
            try {
              const raw = await res.text();
              console.log(`  Raw body (first 300 chars):`, raw.slice(0, 300));
            } catch {}
            continue;
          }

          const grouped = data?.["cdn-live-tv"];
          console.log(
            `  Has "cdn-live-tv" key:`,
            !!grouped,
            `| type:`,
            typeof grouped,
          );

          if (!grouped || typeof grouped !== "object") {
            console.warn(`  ⚠️ No valid "cdn-live-tv" object, skipping`);
            continue;
          }

          const groupKeys = Object.keys(grouped);
          console.log(`  Group keys:`, groupKeys);

          for (const key of groupKeys) {
            const group = grouped[key];
            if (!Array.isArray(group)) {
              console.log(
                `  Group "${key}" is not an array (type: ${typeof group}), skipping`,
              );
              continue;
            }

            console.log(`  Group "${key}" has ${group.length} events`);

            for (const dto of group as CdnEventDTO[]) {
              if (dto.gameID === gameId) {
                console.log(
                  `  🎯 MATCH FOUND in sport=${sport}, group=${key}, gameID=${dto.gameID}`,
                );
                console.log(
                  `     event: ${dto.event}, channels: ${dto.channels?.length ?? 0}`,
                );
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

          if (found.length > 0) {
            console.log(`  🎉 Found ${found.length} channels, stopping search`);
            break;
          } else {
            console.log(`  🔍 No match in ${sport}, trying next sport...`);
          }
        }

        console.log(
          `🏁 Final result: ${found.length} channels, error: ${found.length === 0 ? "NO STREAMS" : "NONE"}`,
        );

        if (!cancelled) {
          setChannels(found);
          if (found.length === 0) {
            setError(
              "No streams found for this event. The match may have ended or is no longer available.",
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
        console.groupEnd();
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

      {/* Channel list — all open in new tab */}
      <section className="w-full bg-black flex-1 flex flex-col pt-16">
        <div className="container-cine flex-1 flex flex-col items-center justify-center text-center py-10">
          {channels.length > 0 ? (
            <>
              <Radio className="w-10 h-10 text-primary animate-pulse mb-4" />
              <h1 className="text-xl font-heading font-bold text-foreground mb-2">
                Choose a stream
              </h1>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                The streams below open in external players. If one doesn't work,
                try another.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
                {channels.map((ch) => (
                  <a
                    key={ch.channel_code + ch.channel_name}
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all group"
                  >
                    <Tv className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ch.channel_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {ch.viewers > 0
                          ? `${ch.viewers} watching`
                          : "Click to watch"}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No playable streams available.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Game ID footer */}
      <section className="bg-card border-t border-border py-3">
        <div className="container-cine text-center">
          <p className="text-xs text-muted-foreground font-mono">
            ID: {gameId}
          </p>
        </div>
      </section>
    </div>
  );
}
