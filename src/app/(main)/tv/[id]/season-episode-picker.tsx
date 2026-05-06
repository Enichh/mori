"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPosterUrl, getStillUrl } from "@/lib/tmdb-image";
import type { Season } from "@/types";

interface SeasonEpisodePickerProps {
  seasons: Season[];
  showId: number;
  showName: string;
}

export function SeasonEpisodePicker({ seasons, showId }: SeasonEpisodePickerProps) {
  const [openSeason, setOpenSeason] = React.useState<number | null>(
    seasons[0]?.seasonNumber ?? null
  );

  const activeSeason = seasons.find((s) => s.seasonNumber === openSeason);

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
              onClick={() => setOpenSeason(
                openSeason === season.seasonNumber ? null : season.seasonNumber
              )}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-sm border transition-all",
                openSeason === season.seasonNumber
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
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
        {activeSeason && activeSeason.episodes && activeSeason.episodes.length > 0 && (
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
                    <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                  </div>
                </div>

                {/* Episode info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-primary font-mono mt-0.5">
                      E{ep.episodeNumber.toString().padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {ep.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {ep.runtime && <span>{ep.runtime} min</span>}
                        {ep.voteAverage > 0 && (
                          <span className="text-primary">★ {ep.voteAverage.toFixed(1)}</span>
                        )}
                        {ep.airDate && (
                          <span>{new Date(ep.airDate).toLocaleDateString()}</span>
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

        {/* Loading state if episodes aren't loaded */}
        {activeSeason && (!activeSeason.episodes || activeSeason.episodes.length === 0) && (
          <Link
            href={`/tv/${showId}/season/${activeSeason.seasonNumber}/episode/1`}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-sm"
          >
            View Season {activeSeason.seasonNumber} Episodes →
          </Link>
        )}
      </div>
    </section>
  );
}
