import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TmdbService } from "@/services/tmdb";
import { VideoPlayerWrapper } from "@/app/(watch)/watch/movie/[id]/video-player-wrapper";
import { getStillUrl } from "@/lib/tmdb-image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface TVWatchPageProps {
  params: Promise<{ id: string; season: string; episode: string }>;
}

export async function generateMetadata({
  params,
}: TVWatchPageProps): Promise<Metadata> {
  const { id, season, episode } = await params;
  try {
    const show = await TmdbService.getInstance().tv.getDetails(
      parseInt(id, 10),
    );
    return {
      title: `Watch ${show.name} S${season} E${episode} | Mori`,
      description: show.overview?.slice(0, 160) || "",
    };
  } catch {
    return { title: "Watch TV Show | Mori" };
  }
}

export default async function TVWatchPage({ params }: TVWatchPageProps) {
  const { id, season: seasonStr, episode: episodeStr } = await params;
  const tmdb = TmdbService.getInstance();
  const showId = parseInt(id, 10);
  const seasonNum = parseInt(seasonStr, 10);
  const episodeNum = parseInt(episodeStr, 10);

  let show = null,
    episode = null,
    seasonData = null;
  try {
    [show, episode, seasonData] = await Promise.all([
      tmdb.tv.getDetails(showId),
      tmdb.tv.getEpisode(showId, seasonNum, episodeNum),
      tmdb.tv.getSeason(showId, seasonNum),
    ]);
  } catch (e) {
    console.error(e);
  }

  if (!show || !episode) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Episode Not Found
        </h1>
        <Link
          href={`/tv/${showId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Show
        </Link>
      </div>
    );
  }

  const episodes = seasonData?.episodes || [];
  const prevEpisode =
    episodes.find(
      (e: { episodeNumber: number }) => e.episodeNumber === episodeNum - 1,
    ) || null;
  const nextEpisode =
    episodes.find(
      (e: { episodeNumber: number }) => e.episodeNumber === episodeNum + 1,
    ) || null;
  const hasPrevSeason = seasonNum > 1;
  const seasons =
    show.seasons?.filter((s: { seasonNumber: number }) => s.seasonNumber > 0) ||
    [];

  // Build a map of season number -> episode count for the in-player navigator
  const episodesPerSeason: Record<number, number> = {};
  seasons.forEach((s: { seasonNumber: number; episodeCount: number }) => {
    episodesPerSeason[s.seasonNumber] = s.episodeCount;
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="w-full bg-black">
        <div className="max-w-[1400px] mx-auto">
          <VideoPlayerWrapper
            tmdbId={showId}
            mediaType="tv"
            title={`${show.name} S${seasonNum} E${episodeNum}`}
            posterPath={show.posterPath}
            backdropPath={show.backdropPath}
            season={seasonNum}
            episode={episodeNum}
            totalSeasons={seasons.length}
            episodesPerSeason={episodesPerSeason}
          />
        </div>
      </section>

      <section className="container-cine py-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/tv/${showId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> {show.name}
          </Link>
        </div>

        <div className="flex items-stretch gap-4 mb-6">
          {prevEpisode ? (
            <Link
              href={`/watch/tv/${showId}/${seasonNum}/${prevEpisode.episodeNumber}`}
              className="flex items-center gap-2 px-4 py-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex-1"
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground">
                  Previous
                </span>
                <p className="font-medium text-foreground text-xs line-clamp-1">
                  E{prevEpisode.episodeNumber}: {prevEpisode.name}
                </p>
              </div>
            </Link>
          ) : hasPrevSeason ? (
            <Link
              href={`/watch/tv/${showId}/${seasonNum - 1}/${seasons.find((s: { seasonNumber: number }) => s.seasonNumber === seasonNum - 1)?.episodeCount || 1}`}
              className="flex items-center gap-2 px-4 py-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex-1"
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground">
                  Previous Season
                </span>
                <p className="font-medium text-foreground text-xs">
                  S{seasonNum - 1}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextEpisode ? (
            <Link
              href={`/watch/tv/${showId}/${seasonNum}/${nextEpisode.episodeNumber}`}
              className="flex items-center gap-2 px-4 py-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex-1 justify-end text-right"
            >
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground">Next</span>
                <p className="font-medium text-foreground text-xs line-clamp-1">
                  E{nextEpisode.episodeNumber}: {nextEpisode.name}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        <div className="flex gap-4 p-4 rounded-lg bg-card border border-border">
          {episode.stillPath && (
            <div className="relative w-24 sm:w-40 aspect-video rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={getStillUrl(episode.stillPath, "w300")}
                alt={episode.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-primary mb-1">
              S{seasonNum} E{episodeNum}
            </p>
            <h2 className="text-base md:text-lg font-heading font-bold text-foreground mb-1">
              {episode.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span>{episode.voteAverage?.toFixed(1) || "N/A"}</span>
              </div>
              {episode.runtime && <span>{episode.runtime} min</span>}
            </div>
            {episode.overview && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {episode.overview}
              </p>
            )}
          </div>
        </div>

        {seasons.length > 1 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Seasons
            </h3>
            <div className="flex flex-wrap gap-2">
              {seasons.map((s: { id: number; seasonNumber: number }) => (
                <Link
                  key={s.id}
                  href={`/watch/tv/${showId}/${s.seasonNumber}/1`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${s.seasonNumber === seasonNum ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"}`}
                >
                  S{s.seasonNumber}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
