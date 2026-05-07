import type { Metadata } from "next";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { SelectSort } from "@/components/ui/select-sort";
import type { Genre } from "@/types";

export const revalidate = 86400;

interface KDramaPageProps {
  searchParams: Promise<{ page?: string; genre?: string; sort?: string }>;
}

export const metadata: Metadata = {
  title: "KDrama 🇰🇷 | Mori",
  description:
    "Stream the most popular Korean dramas and TV shows. From romance to thriller, find your next KDrama obsession.",
};

const SORT_OPTIONS = [
  { value: "popularity.desc" as const, label: "Most Popular" },
  { value: "vote_average.desc" as const, label: "Highest Rated" },
  { value: "first_air_date.desc" as const, label: "Newest" },
];

export default async function KDramaPage({ searchParams }: KDramaPageProps) {
  const { page = "1", genre, sort = "popularity.desc" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const tmdb = TmdbService.getInstance();

  const [kdramaResult, tvGenresResult] = await Promise.allSettled([
    tmdb.tv.discoverKDrama({
      sort_by: sort,
      with_genres: genre ? parseInt(genre, 10) : undefined,
      page: currentPage,
    }),
    tmdb.genres.getTVGenres(),
  ]);

  const kdramaData =
    kdramaResult.status === "fulfilled" ? kdramaResult.value : null;
  const genres: Genre[] =
    tvGenresResult.status === "fulfilled" ? tvGenresResult.value : [];

  return (
    <div className="container-cine py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          KDrama <span className="text-primary">🇰🇷</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover the best Korean dramas — from heart-wrenching romance to
          edge-of-your-seat thrillers.
        </p>
      </div>

      {genres.length > 0 && (
        <GenreFilter
          genres={genres}
          activeGenre={genre}
          baseHref="/kdrama"
          currentSort={sort}
        />
      )}

      <div className="flex items-center justify-between py-4 border-b border-border">
        <p className="text-xs text-muted-foreground">
          {kdramaData?.totalResults?.toLocaleString() || 0} shows found
        </p>
        <SelectSort
          options={SORT_OPTIONS}
          currentSort={sort}
          baseHref="/kdrama"
          genre={genre}
        />
      </div>

      {kdramaData && kdramaData.results.length > 0 && (
        <MediaGrid title="" items={kdramaData.results} mediaType="tv" />
      )}

      {(!kdramaData || kdramaData.results.length === 0) && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No KDramas found.</p>
        </div>
      )}

      {/* In-content ad — subtle separator before pagination */}
      {kdramaData && kdramaData.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={kdramaData.totalPages}
          baseHref="/kdrama"
          searchParams={{
            genre: genre || "",
            sort: sort !== "popularity.desc" ? sort : "",
          }}
        />
      )}
    </div>
  );
}
