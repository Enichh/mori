import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { SeasonEpisodePicker } from "./season-episode-picker";
import { Star, Calendar, Play, ChevronLeft } from "lucide-react";
import { getPosterUrl, getBackdropUrl, getProfileUrl } from "@/lib/tmdb-image";

export const revalidate = 86400;

interface TVDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TVDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const show = await TmdbService.getInstance().tv.getDetails(
      parseInt(id, 10),
    );
    return {
      title: `${show.name} | Mori`,
      description: show.overview?.slice(0, 160) || "",
      openGraph: {
        title: show.name,
        description: show.overview?.slice(0, 160) || "",
        images: show.posterPath
          ? [`https://image.tmdb.org/t/p/w500${show.posterPath}`]
          : [],
      },
    };
  } catch {
    return { title: "TV Show Details | Mori" };
  }
}

export default async function TVDetailPage({ params }: TVDetailPageProps) {
  const { id } = await params;
  const tmdb = TmdbService.getInstance();
  const showId = parseInt(id, 10);

  let show = null;
  try {
    show = await tmdb.tv.getDetails(showId);
  } catch (e) {
    console.error(e);
  }

  if (!show) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          TV Show Not Found
        </h1>
        <Link
          href="/tv"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to TV Shows
        </Link>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(show.backdropPath, "w1280");
  const posterUrl = getPosterUrl(show.posterPath, "w500");
  const cast = show.credits?.cast?.slice(0, 20) || [];
  const similarShows = show.similar?.results?.slice(0, 12) || [];
  const seasons = show.seasons?.filter((s) => s.seasonNumber > 0) || [];
  const firstSeason = seasons[0];
  const lastSeason = seasons[seasons.length - 1];

  // Fetch first season with episodes for the episode picker
  let firstSeasonWithEpisodes = null;
  if (firstSeason) {
    try {
      firstSeasonWithEpisodes = await tmdb.tv.getSeason(
        showId,
        firstSeason.seasonNumber,
      );
    } catch {
      // Episodes will fall back to the "View Season" link
    }
  }

  // Merge first season's episodes into the seasons array
  const enhancedSeasons = seasons.map((s) => {
    if (s.seasonNumber === firstSeasonWithEpisodes?.seasonNumber) {
      return firstSeasonWithEpisodes;
    }
    return s;
  });

  return (
    <div>
      <section className="relative w-full min-h-[50vh] md:min-h-[65vh] flex items-end pb-10 md:pb-16 overflow-hidden">
        {backdropUrl && (
          <>
            <Image
              src={backdropUrl}
              alt={show.name}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 gradient-overlay-full" />
          </>
        )}
        {!backdropUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
        )}

        <div className="container-cine relative z-10">
          <Link
            href="/tv"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to TV Shows
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="hidden md:block relative w-48 lg:w-56 aspect-[2/3] rounded-lg overflow-hidden border border-border flex-shrink-0 shadow-2xl">
              <Image
                src={posterUrl}
                alt={show.name}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-display-sm font-heading font-bold text-foreground mb-3 break-words">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="text-sm text-primary/80 italic mb-4">
                  {show.tagline}
                </p>
              )}

              <div className="inline-flex flex-wrap items-center gap-4 mb-4 text-sm bg-black/40 backdrop-blur-sm rounded-sm px-4 py-2 border border-white/10">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-white font-semibold">
                    {show.voteAverage?.toFixed(1)}
                  </span>
                  <span className="text-white/50">
                    ({show.voteCount?.toLocaleString()})
                  </span>
                </div>
                {show.firstAirDate && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span>
                      {new Date(show.firstAirDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <span className="text-white/80">
                  {show.numberOfSeasons} season
                  {show.numberOfSeasons !== 1 ? "s" : ""}
                </span>
                <span className="text-white/80">
                  {show.numberOfEpisodes} episode
                  {show.numberOfEpisodes !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres?.map((g) => (
                  <Link
                    key={g.id}
                    href={`/tv?genre=${g.id}`}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>

              {show.overview && (
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 mb-6 max-w-2xl">
                  <p className="text-sm md:text-base text-white/85 leading-relaxed break-words">
                    {show.overview}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {firstSeason && (
                  <Link
                    href={`/watch/tv/${showId}/${firstSeason.seasonNumber}/1`}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    <Play className="w-5 h-5 fill-current" /> Watch S
                    {firstSeason.seasonNumber} E1
                  </Link>
                )}
                {lastSeason &&
                  lastSeason.seasonNumber !== firstSeason?.seasonNumber && (
                    <Link
                      href={`/watch/tv/${showId}/${lastSeason.seasonNumber}/1`}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors border border-white/20"
                    >
                      <Play className="w-5 h-5 fill-current" /> Watch Latest — S
                      {lastSeason.seasonNumber} E1
                    </Link>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {enhancedSeasons.length > 0 && (
        <SeasonEpisodePicker
          seasons={enhancedSeasons}
          showId={showId}
          showName={show.name}
        />
      )}

      {cast.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {cast.map((m) => (
                <div key={m.id} className="flex-shrink-0 w-28 text-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-card border border-border mb-2 mx-auto">
                    <Image
                      src={getProfileUrl(m.profilePath, "w185")}
                      alt={m.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {m.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {m.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* In-content ad between cast and similar */}
      {similarShows.length > 0 && (
        <MediaGrid
          title="Similar TV Shows"
          items={similarShows}
          mediaType="tv"
        />
      )}
    </div>
  );
}
