import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnilistService } from "@/services/anilist";
import { AnimeWatchPlayer } from "./anime-watch-player";
import { Star, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 31536000;

interface AnimeWatchPageProps {
  params: Promise<{ id: string; episode: string }>;
}

export async function generateMetadata({
  params,
}: AnimeWatchPageProps): Promise<Metadata> {
  const { id, episode } = await params;
  try {
    const anime = await AnilistService.getInstance().anime.getDetails(
      parseInt(id, 10),
    );
    return {
      title: `Watch ${anime.title} E${episode} | Mori`,
      description:
        anime.description?.slice(0, 160)?.replace(/<[^>]*>/g, "") || "",
    };
  } catch {
    return { title: "Watch Anime | Mori" };
  }
}

export default async function AnimeWatchPage({ params }: AnimeWatchPageProps) {
  const { id, episode: epStr } = await params;
  const anilistId = parseInt(id, 10);
  const episodeNum = parseInt(epStr, 10);
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

  const totalEpisodes = anime.episodes ?? 0;
  const hasPrev = episodeNum > 1;
  const hasNext = episodeNum < totalEpisodes;

  return (
    <div className="min-h-screen bg-background">
      {/* Player Section */}
      <section className="w-full bg-black">
        <div className="max-w-[1400px] mx-auto">
          <AnimeWatchPlayer
            anilistId={anilistId}
            episode={episodeNum}
            title={`${anime.title} — Episode ${episodeNum}`}
            coverImage={anime.bannerImage ?? anime.coverImage}
          />
        </div>
      </section>

      {/* Episode Info */}
      <section className="container-cine py-6">
        <Link
          href={`/anime/${anilistId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> {anime.title}
        </Link>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-24 sm:w-32 aspect-[2/3] rounded-md overflow-hidden border border-border flex-shrink-0 hidden sm:block">
            <Image
              src={anime.coverImage}
              alt={anime.title}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-primary mb-1">
              Episode {episodeNum}
            </p>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
              {anime.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
              {anime.averageScore && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-foreground font-semibold">
                    {anime.averageScore / 10}%
                  </span>
                </div>
              )}
              {totalEpisodes > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{totalEpisodes} episodes</span>
                </div>
              )}
              {anime.season && anime.seasonYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {anime.season} {anime.seasonYear}
                  </span>
                </div>
              )}
              <span
                className={`px-2 py-0.5 text-[10px] rounded-sm font-medium ${anime.status === "RELEASING" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}
              >
                {anime.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {anime.genres?.map((g: string) => (
                <span
                  key={g}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-primary/10 text-primary border border-primary/20"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Episode Navigation */}
        <div className="flex items-center gap-4 mt-6">
          {hasPrev ? (
            <Link
              href={`/watch/anime/${anilistId}/${episodeNum - 1}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Link>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground/40 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" /> Previous
            </span>
          )}
          <div className="flex-1 text-center text-xs text-muted-foreground">
            Episode {episodeNum} of {totalEpisodes || "?"}
          </div>
          {hasNext ? (
            <Link
              href={`/watch/anime/${anilistId}/${episodeNum + 1}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground/40 cursor-not-allowed">
              Next <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
