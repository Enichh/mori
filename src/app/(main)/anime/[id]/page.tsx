import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { Star, Calendar, Play, ChevronLeft } from "lucide-react";
import { getPosterUrl, getBackdropUrl, getProfileUrl } from "@/lib/tmdb-image";

export const revalidate = 86400;

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AnimeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const anime = await TmdbService.getInstance().anime.getDetails(
      parseInt(id, 10),
    );
    return {
      title: `${anime.name || "Anime"} — Anime | Mori`,
      description: anime.overview?.slice(0, 160) || "",
    };
  } catch {
    return { title: "Anime Details | Mori" };
  }
}

export default async function AnimeDetailPage({
  params,
}: AnimeDetailPageProps) {
  const { id } = await params;
  const tmdb = TmdbService.getInstance();
  const animeId = parseInt(id, 10);

  let anime = null;
  try {
    anime = await tmdb.anime.getDetails(animeId);
  } catch (e) {
    console.error(e);
  }

  if (!anime) {
    return (
      <div className="container-cine py-20 text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Anime Not Found
        </h1>
        <Link
          href="/anime"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Anime
        </Link>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(anime.backdropPath, "w1280");
  const posterUrl = getPosterUrl(anime.posterPath, "w500");
  const cast = anime.credits?.cast?.slice(0, 20) || [];
  const similarAnime = (anime as any).similar?.results?.slice(0, 12) || [];
  const seasons =
    anime.seasons?.filter(
      (s: { seasonNumber: number }) => s.seasonNumber > 0,
    ) || [];
  const firstSeason = seasons[0];

  return (
    <div>
      <section className="relative w-full min-h-[50vh] md:min-h-[65vh] flex items-end pb-10 md:pb-16 overflow-hidden">
        {backdropUrl && (
          <>
            <Image
              src={backdropUrl}
              alt={anime.name}
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
            href="/anime"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Anime
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="hidden md:block relative w-48 lg:w-56 aspect-[2/3] rounded-lg overflow-hidden border border-border flex-shrink-0 shadow-2xl">
              <Image
                src={posterUrl}
                alt={anime.name}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl lg:text-display-sm font-heading font-bold text-foreground mb-3">
                {anime.name}
              </h1>
              {anime.tagline && (
                <p className="text-sm text-primary/80 italic mb-4">
                  {anime.tagline}
                </p>
              )}
              <div className="inline-flex flex-wrap items-center gap-4 mb-4 text-sm bg-black/40 backdrop-blur-sm rounded-sm px-4 py-2 border border-white/10">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-white font-semibold">
                    {anime.voteAverage?.toFixed(1)}
                  </span>
                  <span className="text-white/50">
                    ({anime.voteCount?.toLocaleString()})
                  </span>
                </div>
                {anime.firstAirDate && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span>
                      {new Date(anime.firstAirDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </span>
                  </div>
                )}
                <span className="text-white/80">
                  {anime.numberOfSeasons} season
                  {anime.numberOfSeasons !== 1 ? "s" : ""}
                </span>
                <span className="text-white/80">
                  {anime.numberOfEpisodes} episode
                  {anime.numberOfEpisodes !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres?.map((g: { id: number; name: string }) => (
                  <span
                    key={g.id}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20"
                  >
                    {g.name}
                  </span>
                ))}
                <span className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20">
                  🇯🇵 Japanese
                </span>
              </div>
              {anime.overview && (
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 mb-6 max-w-2xl">
                  <p className="text-sm md:text-base text-white/85 leading-relaxed">
                    {anime.overview}
                  </p>
                </div>
              )}
              {firstSeason && (
                <Link
                  href={`/watch/tv/${animeId}/${firstSeason.seasonNumber}/1`}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  <Play className="w-5 h-5 fill-current" /> Watch S
                  {firstSeason.seasonNumber} E1
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {seasons.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Seasons ({seasons.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {seasons.map(
                (season: {
                  id: number;
                  name: string;
                  seasonNumber: number;
                  episodeCount: number;
                  posterPath: string | null;
                }) => (
                  <Link
                    key={season.id}
                    href={`/watch/tv/${animeId}/${season.seasonNumber}/1`}
                    className="flex gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group"
                  >
                    <div className="relative w-20 aspect-[2/3] rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      <Image
                        src={getPosterUrl(season.posterPath, "w154")}
                        alt={season.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {season.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {season.episodeCount} episodes
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {cast.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {cast.map(
                (m: {
                  id: number;
                  name: string;
                  character: string;
                  profilePath: string | null;
                }) => (
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
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {similarAnime.length > 0 && (
        <MediaGrid
          title="Similar Anime"
          items={similarAnime}
          mediaType="anime"
        />
      )}
    </div>
  );
}
