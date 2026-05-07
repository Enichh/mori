import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { MovieJsonLd } from "@/components/seo/movie-jsonld";
import { Star, Clock, Calendar, Play, ChevronLeft } from "lucide-react";
import { getPosterUrl, getBackdropUrl, getProfileUrl } from "@/lib/tmdb-image";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://morimovie.netlify.app";

export const revalidate = 86400;

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MovieDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const tmdb = TmdbService.getInstance();
  try {
    const movie = await tmdb.movies.getDetails(parseInt(id, 10));
    const year = movie.releaseDate
      ? new Date(movie.releaseDate).getFullYear()
      : "";
    const genres = movie.genres?.map((g) => g.name).join(", ") || "";
    const cast =
      movie.credits?.cast
        ?.slice(0, 3)
        .map((c) => c.name)
        .join(", ") || "";

    const title = `Watch ${movie.title}${year ? ` (${year})` : ""} Online Free HD | Mori`;
    const description =
      movie.overview?.slice(0, 155) ||
      `Stream ${movie.title} online free in HD. ${genres ? `${genres}. ` : ""}${cast ? `Starring ${cast}. ` : ""}Watch now on Mori.`;

    return {
      title,
      description,
      keywords: [
        movie.title,
        "watch online free",
        "streaming",
        "HD",
        ...(movie.genres?.map((g) => g.name) || []),
        "free movies",
        "Mori",
      ],
      alternates: { canonical: `${BASE_URL}/movies/${movie.id}` },
      openGraph: {
        title,
        description,
        type: "video.movie",
        images: movie.posterPath
          ? [
              {
                url: `https://image.tmdb.org/t/p/w500${movie.posterPath}`,
                width: 500,
                height: 750,
                alt: movie.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: movie.posterPath
          ? [`https://image.tmdb.org/t/p/w500${movie.posterPath}`]
          : [],
      },
    };
  } catch {
    return { title: "Movie Details | Mori" };
  }
}

export default async function MovieDetailPage({
  params,
}: MovieDetailPageProps) {
  const { id } = await params;
  const tmdb = TmdbService.getInstance();
  const movieId = parseInt(id, 10);

  let movie = null;
  try {
    movie = await tmdb.movies.getDetails(movieId);
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
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

  const backdropUrl = getBackdropUrl(movie.backdropPath, "w1280");
  const posterUrl = getPosterUrl(movie.posterPath, "w500");
  const directors =
    movie.credits?.crew
      ?.filter((c) => c.job === "Director")
      .map((c) => c.name) || [];
  const cast = movie.credits?.cast?.slice(0, 20) || [];
  const similarMovies = movie.similar?.results?.slice(0, 12) || [];

  return (
    <div>
      <MovieJsonLd
        media={movie}
        mediaType="movie"
        url={`${BASE_URL}/movies/${movieId}`}
      />

      <section className="relative w-full min-h-[50vh] md:min-h-[65vh] flex items-end pb-10 md:pb-16 overflow-hidden">
        {backdropUrl && (
          <>
            <Image
              src={backdropUrl}
              alt={movie.title}
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
            href="/movies"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="hidden md:block relative w-48 lg:w-56 aspect-[2/3] rounded-lg overflow-hidden border border-border flex-shrink-0 shadow-2xl">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-display-sm font-heading font-bold text-foreground mb-3 break-words">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-sm text-primary/80 italic mb-4">
                  {movie.tagline}
                </p>
              )}

              <div className="inline-flex flex-wrap items-center gap-4 mb-4 text-sm bg-black/40 backdrop-blur-sm rounded-sm px-4 py-2 border border-white/10">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-white font-semibold">
                    {movie.voteAverage?.toFixed(1)}
                  </span>
                  <span className="text-white/50">
                    ({movie.voteCount?.toLocaleString()})
                  </span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Clock className="w-4 h-4 text-white/60" />
                    <span>
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </span>
                  </div>
                )}
                {movie.releaseDate && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span>
                      {new Date(movie.releaseDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/movies?genre=${genre.id}`}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {movie.overview && (
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 mb-6 max-w-2xl">
                  <p className="text-sm md:text-base text-white/85 leading-relaxed break-words">
                    {movie.overview}
                  </p>
                </div>
              )}

              {directors.length > 0 && (
                <p className="text-sm text-muted-foreground mb-6">
                  <span className="text-foreground font-medium">
                    Director{directors.length > 1 ? "s" : ""}:{" "}
                  </span>
                  {directors.join(", ")}
                </p>
              )}

              <Link
                href={`/watch/movie/${movieId}`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Play className="w-5 h-5 fill-current" /> Watch Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {cast.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {cast.map((member) => (
                <div key={member.id} className="flex-shrink-0 w-28 text-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-card border border-border mb-2 mx-auto">
                    <Image
                      src={getProfileUrl(member.profilePath, "w185")}
                      alt={member.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {member.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* In-content ad between cast and similar */}
      {similarMovies.length > 0 && (
        <MediaGrid
          title="Similar Movies"
          items={similarMovies}
          mediaType="movie"
        />
      )}
    </div>
  );
}
