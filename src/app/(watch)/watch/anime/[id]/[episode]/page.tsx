import type { Metadata } from "next";
import { AnimeWatchClient } from "./anime-watch-client";

export const revalidate = 31536000;

export const metadata: Metadata = {
  title: "Watch Anime | Mori",
  description: "Stream anime episodes online.",
};

interface Props {
  params: Promise<{ id: string; episode: string }>;
}

export async function generateStaticParams() {
  try {
    const { AnilistService } = await import("@/services/anilist");
    const trending = await AnilistService.getInstance().anime.getTrending();
    return trending.results.slice(0, 50).map((a) => ({
      id: String(a.id),
      episode: "1",
    }));
  } catch {
    return [];
  }
}

export default async function AnimeWatchPage({ params }: Props) {
  const { id, episode } = await params;
  return (
    <AnimeWatchClient anilistId={parseInt(id)} episode={parseInt(episode)} />
  );
}
