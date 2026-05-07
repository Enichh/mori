import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TmdbService } from "@/services/tmdb";
import { getStillUrl, getPosterUrl } from "@/lib/tmdb-image";
import { Star, ChevronLeft, ChevronRight, Play } from "lucide-react";

export const revalidate = 31536000;

interface EpisodePageProps {
  params: Promise<{ id: string; season: string; episode: string }>;
}

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { id, season, episode } = await params;
  try {
    const [show, ep] = await Promise.all([
      TmdbService.getInstance().tv.getDetails(parseInt(id, 10)),
      TmdbService.getInstance().tv.getEpisode(
        parseInt(id, 10),
        parseInt(season, 10),
        parseInt(episode, 10),
      ),
    ]);
    return {
      title: `${show.name} S${season} E${episode} — ${ep.name || ""} | Mori`,
      description:
        ep.overview?.slice(0, 160) || show.overview?.slice(0, 160) || "",
    };
  } catch {
    return { title: "Episode | Mori" };
  }
}

export default async function EpisodePage({ params }: EpisodePageProps) {
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

  return (
    <div className="container-cine py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          href={`/tv/${showId}`}
          className="hover:text-foreground transition-colors"
        >
          {show.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          href={`/tv/${showId}/season/${seasonNum}/episode/1`}
          className="hover:text-foreground transition-colors"
        >
          Season {seasonNum}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">Episode {episodeNum}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-card border border-border mb-6">
            {episode.stillPath ? (
              <Image
                src={getStillUrl(episode.stillPath, "w780")}
                alt={episode.name}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No preview available</p>
              </div>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            {episode.name}
          </h1>
          <p className="text-sm text-primary font-mono mb-4">
            S{seasonNum} • E{episodeNum}
            {episode.airDate &&
              ` • ${new Date(episode.airDate).toLocaleDateString()}`}
          </p>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm text-foreground font-semibold">
                {episode.voteAverage?.toFixed(1) || "N/A"}
              </span>
            </div>
            {episode.runtime && (
              <span className="text-sm text-muted-foreground">
                {episode.runtime} min
              </span>
            )}
          </div>

          {episode.overview && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
              {episode.overview}
            </p>
          )}

          <Link
            href={`/watch/tv/${showId}/${seasonNum}/${episodeNum}`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Play className="w-5 h-5 fill-current" /> Watch This Episode
          </Link>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {prevEpisode ? (
              <Link
                href={`/tv/${showId}/season/${seasonNum}/episode/${prevEpisode.episodeNumber}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <div>
                  <span className="text-xs text-muted-foreground">
                    Previous
                  </span>
                  <p className="font-medium text-foreground line-clamp-1">
                    {prevEpisode.name}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextEpisode && (
              <Link
                href={`/tv/${showId}/season/${seasonNum}/episode/${nextEpisode.episodeNumber}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-right"
              >
                <div>
                  <span className="text-xs text-muted-foreground">Next</span>
                  <p className="font-medium text-foreground line-clamp-1">
                    {nextEpisode.name}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">
              Episodes — S{seasonNum}
            </h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {episodes.map(
                (ep: {
                  id: number;
                  episodeNumber: number;
                  name: string;
                  stillPath: string | null;
                  runtime: number | null;
                  voteAverage: number;
                }) => (
                  <Link
                    key={ep.id}
                    href={`/tv/${showId}/season/${seasonNum}/episode/${ep.episodeNumber}`}
                    className={`flex gap-3 p-3 rounded-md transition-colors ${ep.episodeNumber === episodeNum ? "bg-primary/10 border border-primary/30" : "hover:bg-card border border-transparent"}`}
                  >
                    <div className="relative w-16 aspect-video rounded overflow-hidden flex-shrink-0 bg-muted">
                      {ep.stillPath && (
                        <Image
                          src={getStillUrl(ep.stillPath, "w185")}
                          alt={ep.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1">
                        {ep.episodeNumber}. {ep.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ep.runtime ? `${ep.runtime}m` : ""}
                        {ep.voteAverage
                          ? ` · ${ep.voteAverage.toFixed(1)}★`
                          : ""}
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
