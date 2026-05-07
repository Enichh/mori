import { MovieDetailClient } from "./movie-detail-client";

export const revalidate = 31536000;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const { TmdbService } = await import("@/services/tmdb");
    const popular = await TmdbService.getInstance().movies.getPopular();
    return popular.results.slice(0, 100).map((m) => ({ id: String(m.id) }));
  } catch {
    return [];
  }
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  return <MovieDetailClient movieId={parseInt(id)} />;
}
