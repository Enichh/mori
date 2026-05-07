import type { Metadata } from "next";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { SelectSort } from "@/components/ui/select-sort";
import type { Genre } from "@/types";

export const revalidate = 86400;

interface TVPageProps {
  searchParams: Promise<{ page?: string; genre?: string; sort?: string }>;
}

export const metadata: Metadata = {
  title: "TV Shows",
  description: "Browse and stream the latest TV shows and series.",
};

const SORT_OPTIONS = [
  { value: "popularity.desc" as const, label: "Most Popular" },
  { value: "vote_average.desc" as const, label: "Highest Rated" },
  { value: "first_air_date.desc" as const, label: "Newest" },
];

export default async function TVPage({ searchParams }: TVPageProps) {
  const { page = "1", genre, sort = "popularity.desc" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const tmdb = TmdbService.getInstance();

  const [showsResult, tvGenresResult] = await Promise.allSettled([
    tmdb.tv.discover({
      sort_by: sort,
      with_genres: genre ? parseInt(genre, 10) : undefined,
      page: currentPage,
    }),
    tmdb.genres.getTVGenres(),
  ]);

  const showsData =
    showsResult.status === "fulfilled" ? showsResult.value : null;
  const genres: Genre[] =
    tvGenresResult.status === "fulfilled" ? tvGenresResult.value : [];

  return (
    <div className="container-cine py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          TV Shows
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover binge-worthy series and trending TV shows.
        </p>
      </div>

      {genres.length > 0 && (
        <GenreFilter
          genres={genres}
          activeGenre={genre}
          baseHref="/tv"
          currentSort={sort}
        />
      )}

      <div className="flex items-center justify-between py-4 border-b border-border">
        <p className="text-xs text-muted-foreground">
          {showsData?.totalResults?.toLocaleString() || 0} shows found
        </p>
        <SelectSort
          options={SORT_OPTIONS}
          currentSort={sort}
          baseHref="/tv"
          genre={genre}
        />
      </div>

      {showsData && showsData.results.length > 0 && (
        <MediaGrid title="" items={showsData.results} mediaType="tv" />
      )}

      {(!showsData || showsData.results.length === 0) && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No TV shows found.</p>
        </div>
      )}

      {/* In-content ad — subtle separator before pagination */}
      {showsData && showsData.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={showsData.totalPages}
          baseHref="/tv"
          searchParams={{
            genre: genre || "",
            sort: sort !== "popularity.desc" ? sort : "",
          }}
        />
      )}
    </div>
  );
}
