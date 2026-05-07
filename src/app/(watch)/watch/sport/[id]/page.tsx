import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  AlertTriangle,
  Tv,
  Radio,
  ExternalLink,
} from "lucide-react";
import { SportsService } from "@/services/sports";
import type { SportChannel } from "@/types";
import { openSmartlink } from "@/lib/smartlink";

export const revalidate = 120; // 2 min for live sports

interface SportWatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SportWatchPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Watch Sports | Mori`,
    description: `Stream live sports event on Mori.`,
  };
}

/** Guess sport category from keywords in the gameID. */
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

export default async function SportWatchPage({ params }: SportWatchPageProps) {
  const { id } = await params;
  const sports = SportsService.getInstance();

  let channels: SportChannel[] = [];
  let error: string | null = null;

  // Try to get cdnlivetv channels by guessing the sport from the gameID
  const sportGuess = guessSportFromId(id);
  if (sportGuess) {
    try {
      const liveEvents = await sports.events.getLiveEvents(sportGuess);
      // Find matching event by gameID or title similarity
      const match = liveEvents.find(
        (e) =>
          e.id === id ||
          e.title.toLowerCase().includes(id.toLowerCase()) ||
          id.toLowerCase().includes(e.title.toLowerCase()),
      );
      if (match?.channels && match.channels.length > 0) {
        channels = match.channels;
      }
    } catch {
      // Silently fail
    }
  }

  // No channels found
  if (channels.length === 0 && !error) {
    error =
      "No streams found for this event. The match may not have started yet or is no longer available.";
  }

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

  // Pick the primary channel
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
                ID: {id}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Channel info */}
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

          {/* Channel list */}
          {channels.length > 1 && (
            <div className="mt-3 flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto scrollbar-none pb-1">
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
