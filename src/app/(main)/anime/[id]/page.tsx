import { AnimeDetailClient } from "./anime-detail-client";

export const revalidate = 31536000;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const { AnilistService } = await import("@/services/anilist");
    const trending = await AnilistService.getInstance().anime.getTrending();
    return trending.results.slice(0, 100).map((a) => ({ id: String(a.id) }));
  } catch {
    return [];
  }
}

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;
  return <AnimeDetailClient anilistId={parseInt(id)} />;
}
