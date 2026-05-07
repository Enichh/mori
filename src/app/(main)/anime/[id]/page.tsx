import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnilistService } from "@/services/anilist";
import { MediaGrid } from "@/components/media/media-grid";
import type { AnilistAnime, AnilistCharacter } from "@/types/media";
import { Star, Calendar, Play, ChevronLeft, Clock, Tv } from "lucide-react";

export const revalidate = 86400;

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AnimeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const anime = await AnilistService.getInstance().anime.getDetails(
      parseInt(id, 10),
    );
    return {
      title: `${anime.title} — Anime | Mori`,
      description:
        anime.description?.slice(0, 160)?.replace(/<[^>]*>/g, "") || "",
    };
  } catch {
    return { title: "Anime Details | Mori" };
  }
}

export default async function AnimeDetailPage({
  params,
}: AnimeDetailPageProps) {
  const { id } = await params;
  const anilistId = parseInt(id, 10);
  const anilist = AnilistService.getInstance();

  let anime = null;
  try {
    anime = await anilist.anime.getDetails(anilistId);
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

  // Map AniList recommendations to TVShow-like shape for MediaGrid
  const similarItems =
    anime.recommendations?.map((r: AnilistAnime & { rating: number }) => ({
      id: r.id,
      mediaType: "anime" as const,
      title: r.title,
      name: r.title,
      originalName: r.nativeTitle,
      overview: r.description,
      posterPath: r.coverImage,
      backdropPath: r.bannerImage,
      voteAverage: r.averageScore ? r.averageScore / 10 : 0,
      voteCount: r.popularity,
      genreIds: [],
      popularity: r.popularity,
      originalLanguage: "ja",
      adult: false,
      firstAirDate: r.seasonYear ? `${r.seasonYear}-01-01` : "",
      lastAirDate: "",
      numberOfSeasons: 1,
      numberOfEpisodes: r.episodes ?? 0,
      status: r.status,
      seasons: [],
      credits: { cast: [], crew: [] },
      similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
      videos: { results: [] },
      nextEpisodeToAir: null,
    })) || [];

  const characters = anime.characters || [];
  const streamingEpisodes = anime.streamingEpisodes || [];

  return (
    <div>
      <section className="relative w-full min-h-[50vh] md:min-h-[65vh] flex items-end pb-10 md:pb-16 overflow-hidden">
        {anime.bannerImage && (
          <>
            <Image
              src={anime.bannerImage}
              alt={anime.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 gradient-overlay-full" />
          </>
        )}
        {!anime.bannerImage && (
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
                src={anime.coverImage}
                alt={anime.title}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-display-sm font-heading font-bold text-foreground mb-2 break-words">
                {anime.title}
              </h1>
              {anime.nativeTitle && anime.nativeTitle !== anime.title && (
                <p className="text-sm text-muted-foreground mb-3">
                  {anime.nativeTitle}
                </p>
              )}

              <div className="inline-flex flex-wrap items-center gap-4 mb-4 text-sm bg-black/40 backdrop-blur-sm rounded-sm px-4 py-2 border border-white/10">
                {anime.averageScore && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-white font-semibold">
                      {anime.averageScore / 10}%
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-white/90">
                  <Tv className="w-4 h-4 text-white/60" />
                  <span>{anime.format}</span>
                </div>
                {anime.episodes && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Clock className="w-4 h-4 text-white/60" />
                    <span>{anime.episodes} eps</span>
                  </div>
                )}
                {anime.season && anime.seasonYear && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span>
                      {anime.season} {anime.seasonYear}
                    </span>
                  </div>
                )}
                <span
                  className={`px-2 py-0.5 text-xs rounded-sm font-medium ${anime.status === "RELEASING" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}
                >
                  {anime.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres?.map((g: string) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20"
                  >
                    {g}
                  </span>
                ))}
                <span className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary border border-primary/20">
                  🇯🇵 Japanese
                </span>
                {anime.studios?.map((s: string) => (
                  <span
                    key={s}
                    className="px-3 py-1 text-xs font-medium rounded-sm bg-muted text-muted-foreground border border-border"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {anime.description && (
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 mb-6 max-w-2xl">
                  <p
                    className="text-sm md:text-base text-white/85 leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ __html: anime.description }}
                  />
                </div>
              )}

              <Link
                href={`/watch/anime/${anilistId}/1`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Play className="w-5 h-5 fill-current" /> Watch Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {streamingEpisodes.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Streaming Episodes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {streamingEpisodes.map((ep: any, i: number) => (
                <a
                  key={i}
                  href={ep.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-all text-sm"
                >
                  <span className="text-xs text-muted-foreground">
                    {ep.site}
                  </span>
                  <p className="font-medium text-foreground line-clamp-2 mt-1">
                    {ep.title}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {characters.length > 0 && (
        <section className="py-10">
          <div className="container-cine">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
              Characters
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {characters.map((c: AnilistCharacter) => (
                <div key={c.id} className="flex-shrink-0 w-32 text-center">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-card border border-border mb-2 mx-auto">
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {c.role}
                  </p>
                  {c.voiceActors?.[0] && (
                    <p className="text-[9px] text-primary/70 line-clamp-1 mt-0.5">
                      VA: {c.voiceActors[0].name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* In-content ad between characters and similar */}
      {similarItems.length > 0 && (
        <MediaGrid
          title="Similar Anime"
          items={similarItems}
          mediaType="anime"
        />
      )}
    </div>
  );
}
