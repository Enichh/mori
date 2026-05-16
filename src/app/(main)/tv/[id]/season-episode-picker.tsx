"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStillUrl } from "@/lib/tmdb-image";
import type { Season, Episode } from "@/types";

interface SeasonEpisodePickerProps {
  seasons: Season[];
  showId: number;
  showName: string;
}

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";

async function fetchSeasonEpisodes(
  showId: number,
  seasonNum: number,
): Promise<Season> {
  const res = await fetch(
    `${TMDB_BASE}/tv/${showId}/season/${seasonNum}?api_key=${TMDB_KEY}`,
  );
  if (!res.ok) throw new Error(`Failed to fetch season ${seasonNum}`);
  const json = await res.json();
  return {
    id: json.id,
    name: json.name,
    overview: json.overview ?? "",
    seasonNumber: json.season_number,
    episodeCount: json.episodes?.length ?? 0,
    posterPath: json.poster_path ?? null,
    airDate: json.air_date ?? null,
    episodes: (json.episodes ?? []).map((ep: Record<string, unknown>) => ({
      id: ep.id as number,
      name: ep.name as string,
      overview: (ep.overview as string) ?? "",
      episodeNumber: ep.episode_number as number,
      seasonNumber: ep.season_number as number,
      stillPath: (ep.still_path as string) ?? null,
      airDate: (ep.air_date as string) ?? null,
      runtime: (ep.runtime as number) ?? null,
      voteAverage: (ep.vote_average as number) ?? 0,
      voteCount: (ep.vote_count as number) ?? 0,
    })),
  };
}

export function SeasonEpisodePicker({
  seasons,
  showId,
}: SeasonEpisodePickerProps) {
  const [openSeason, setOpenSeason] = React.useState<number | null>(
    seasons[0]?.seasonNumber ?? null,
  );
  // Store enriched season data (with episodes) keyed by season number
  const [loadedSeasons, setLoadedSeasons] = React.useState<Map<number, Season>>(
    new Map(),
  );
  const [loadingSeason, setLoadingSeason] = React.useState<number | null>(null);

  // When the user clicks a season tab, fetch its episodes if not already loaded
  React.useEffect(() => {
    if (openSeason === null) return;
    if (loadedSeasons.has(openSeason)) return;

    let cancelled = false;
    setLoadingSeason(openSeason);

    fetchSeasonEpisodes(showId, openSeason)
      .then((season) => {
        if (cancelled) return;
        setLoadedSeasons((prev) => new Map(prev).set(openSeason!, season));
      })
      .catch(() => {
        // Silently fail — user can retry by toggling the tab
      })
      .finally(() => {
        if (!cancelled) setLoadingSeason(null);
      });

    return () => {
      cancelled = true;
    };
  }, [openSeason, showId]);

  // Prefer the loaded season (with episodes), fall back to the prop season
  const baseSeason = seasons.find((s) => s.seasonNumber === openSeason);
  const activeSeason =
    (openSeason !== null && loadedSeasons.get(openSeason)) ?? baseSeason;

  return (
    <section className="py-10">
      <div className="container-cine">
        <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
          Episodes
        </h2>

        {/* Season selector tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() =>
                setOpenSeason(
                  openSeason === season.seasonNumber
                    ? null
                    : season.seasonNumber,
                )
              }
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-sm border transition-all",
                openSeason === season.seasonNumber
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30",
              )}
            >
              S{season.seasonNumber}
              {openSeason === season.seasonNumber ? (
                <ChevronUp className="inline w-3 h-3 ml-1" />
              ) : (
                <ChevronDown className="inline w-3 h-3 ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* Episode list for selected season */}
        {activeSeason &&
          activeSeason.episodes &&
          activeSeason.episodes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono mb-3">
                {activeSeason.name} — {activeSeason.episodes.length} episodes
              </p>
              {activeSeason.episodes.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/watch/tv/${showId}/${activeSeason.seasonNumber}/${ep.episodeNumber}`}
                  className="flex gap-4 p-3 rounded-sm bg-card border border-border hover:border-primary/30 hover:bg-card-hover transition-all group"
                >
                  {/* Episode still */}
                  <div className="relative w-32 sm:w-40 aspect-video rounded-sm overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={getStillUrl(ep.stillPath, "w300")}
                      alt={ep.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play
                        className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="white"
                      />
                    </div>
                  </div>

                  {/* Episode info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-primary font-mono mt-0.5 shrink-0">
                        E{ep.episodeNumber.toString().padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {ep.name}
                        </h4>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          {ep.runtime && <span>{ep.runtime} min</span>}
                          {ep.voteAverage > 0 && (
                            <span className="text-primary">
                              ★ {ep.voteAverage.toFixed(1)}
                            </span>
                          )}
                          {ep.airDate && (
                            <span>
                              {new Date(ep.airDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {ep.overview && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                            {ep.overview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        {/* Loading spinner while fetching episodes */}
        {loadingSeason === openSeason && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* Fallback: no episodes after loading, or empty season */}
        {activeSeason &&
          loadingSeason !== openSeason &&
          (!activeSeason.episodes || activeSeason.episodes.length === 0) && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No episodes found for Season {activeSeason.seasonNumber}.
            </p>
          )}
      </div>
    </section>
  );
}
