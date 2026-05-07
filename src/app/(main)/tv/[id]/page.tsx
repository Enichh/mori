import { TVDetailClient } from "./tv-detail-client";

export const revalidate = 31536000;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const { TmdbService } = await import("@/services/tmdb");
    const popular = await TmdbService.getInstance().tv.getPopular();
    return popular.results.slice(0, 100).map((s) => ({ id: String(s.id) }));
  } catch {
    return [];
  }
}

export default async function TVDetailPage({ params }: Props) {
  const { id } = await params;
  return <TVDetailClient showId={parseInt(id)} />;
}
