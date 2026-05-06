import Image from "next/image";
import { Clock, Calendar, Star, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPosterUrl, getBackdropUrl } from "@/lib/tmdb-image";
import { Badge } from "@/components/ui/badge";
import { CastList } from "@/components/media/cast-list";
import type { Movie, TVShow, Anime, MediaType } from "@/types";

interface MediaInfoProps {
  media: Movie | TVShow | Anime;
  mediaType: MediaType;
  className?: string;
}

function formatRuntime(minutes?: number): string {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function MediaInfo({ media, mediaType, className }: MediaInfoProps) {
  const posterUrl = getPosterUrl(media.posterPath, "w500");
  const backdropUrl = getBackdropUrl(media.backdropPath, "w1280");
  const title = (media as Movie).title || (media as TVShow).name || "Untitled";
  const tagline = "tagline" in media ? (media as Movie).tagline : undefined;
  const overview = media.overview;
  const genres = media.genres || [];
  const rating = media.voteAverage
    ? Math.round(media.voteAverage * 10) / 10
    : null;
  const status = media.status;
  const runtime = (media as Movie).runtime;
  const seasons = (media as TVShow).numberOfSeasons;
  const episodes = (media as TVShow).numberOfEpisodes;
  const releaseDate = (media as Movie).releaseDate;
  const firstAirDate = (media as TVShow).firstAirDate;
  const cast = media.credits?.cast?.slice(0, 10) || [];
  const date = releaseDate || firstAirDate;

  return (
    <div className={cn("", className)}>
      {/* Backdrop behind the info area */}
      {backdropUrl && (
        <div className="relative w-full h-48 md:h-64 overflow-hidden -mt-16">
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[1440px] mx-auto px-4",
          backdropUrl ? "-mt-32" : "mt-0",
        )}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="relative w-48 md:w-56 aspect-[2/3] border border-border overflow-hidden bg-muted">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 192px, 224px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <span className="text-xs font-mono">No Poster</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-display-sm md:text-heading-lg text-foreground mb-2">
              {title}
            </h1>

            {tagline && (
              <p className="text-sm text-muted-foreground italic font-body mb-4">
                {tagline}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {rating !== null && (
                <Badge
                  variant="primary"
                  className="flex items-center gap-1.5 px-3 py-1"
                >
                  <Star className="h-3.5 w-3.5" fill="currentColor" />
                  <span className="font-semibold">{rating}</span>
                </Badge>
              )}
              {date && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                  <Calendar className="h-4 w-4" />
                  {formatDate(date)}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                  <Clock className="h-4 w-4" />
                  {formatRuntime(runtime)}
                </span>
              )}
              {runtime && mediaType !== "movie" && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                  <Clock className="h-4 w-4" />
                  {formatRuntime(runtime)} / ep
                </span>
              )}
              {status && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                  <Activity className="h-4 w-4" />
                  {status}
                </span>
              )}
            </div>

            {/* Season/Episode info for TV */}
            {mediaType === "tv" && (
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground font-body">
                {seasons !== undefined && (
                  <span>
                    <strong className="text-foreground">{seasons}</strong>{" "}
                    Season{seasons !== 1 ? "s" : ""}
                  </span>
                )}
                {episodes !== undefined && (
                  <span>
                    <strong className="text-foreground">{episodes}</strong>{" "}
                    Episode{episodes !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((genre) => (
                  <Badge key={genre.id} variant="outline">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Overview */}
            {overview && (
              <div className="mb-6">
                <h3 className="font-heading text-sm text-foreground uppercase tracking-wider mb-2">
                  Overview
                </h3>
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 max-w-3xl">
                  <p className="text-sm text-white/85 font-body leading-relaxed">
                    {overview}
                  </p>
                </div>
              </div>
            )}

            {/* Cast preview */}
            {cast.length > 0 && (
              <div>
                <h3 className="font-heading text-sm text-foreground uppercase tracking-wider mb-3">
                  Cast
                </h3>
                <CastList cast={cast} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
