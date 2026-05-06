import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TmdbService } from "@/services/tmdb";
import { VideoPlayerWrapper } from "./video-player-wrapper";
import { getPosterUrl } from "@/lib/tmdb-image";
import { Star, Clock, Calendar, ChevronLeft } from "lucide-react";

interface MovieWatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MovieWatchPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await TmdbService.getInstance().movies.getDetails(
      parseInt(id, 10),
    );
    return {
      title: `Watch ${movie.title} | Mori`,
      description: movie.overview?.slice(0, 160) || "",
    };
  } catch {
    return { title: "Watch Movie | Mori" };
  }
}

export default async function MovieWatchPage({ params }: MovieWatchPageProps) {
  const { id } = await params;
  const tmdb = TmdbService.getInstance();
  const movieId = parseInt(id, 10);

  let movie = null;
  try {
    movie = await tmdb.movies.getDetails(movieId);
  } catch (e) {
    console.error(e);
  }

  if (!movie) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Movie Not Found
        </h1>
        <Link
          href="/movies"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="w-full bg-black">
        <div className="max-w-[1400px] mx-auto">
          <VideoPlayerWrapper
            tmdbId={movieId}
            mediaType="movie"
            title={movie.title}
            posterPath={movie.posterPath}
            backdropPath={movie.backdropPath}
          />
        </div>
      </section>

      <section className="container-cine py-6">
        <Link
          href={`/movies/${movieId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Details
        </Link>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-24 sm:w-32 aspect-[2/3] rounded-md overflow-hidden border border-border flex-shrink-0 hidden sm:block">
            <Image
              src={getPosterUrl(movie.posterPath, "w342")}
              alt={movie.title}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-foreground font-semibold">
                  {movie.voteAverage?.toFixed(1)}
                </span>
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                </div>
              )}
              {movie.releaseDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {movie.genres?.map((g: { id: number; name: string }) => (
                <span
                  key={g.id}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-primary/10 text-primary border border-primary/20"
                >
                  {g.name}
                </span>
              ))}
            </div>
            {movie.overview && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {movie.overview}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
