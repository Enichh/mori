import { EpisodeDetailClient } from "./episode-detail-client";

export const revalidate = 31536000;

interface Props {
  params: Promise<{ id: string; season: string; episode: string }>;
}

export async function generateStaticParams() {
  try {
    const { TmdbService } = await import("@/services/tmdb");
    const popular = await TmdbService.getInstance().tv.getPopular();
    return popular.results.slice(0, 50).map((s) => ({
      id: String(s.id),
      season: "1",
      episode: "1",
    }));
  } catch {
    return [];
  }
}

export default async function EpisodeDetailPage({ params }: Props) {
  const { id, season, episode } = await params;
  return (
    <EpisodeDetailClient
      showId={parseInt(id)}
      seasonNum={parseInt(season)}
      episodeNum={parseInt(episode)}
    />
  );
}
