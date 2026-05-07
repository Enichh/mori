import type { Metadata } from "next";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { SelectSort } from "@/components/ui/select-sort";
import type { Genre, TVShow } from "@/types";

export const revalidate = 86400;

interface PinoyPageProps {
  searchParams: Promise<{ page?: string; genre?: string; sort?: string }>;
}

export const metadata: Metadata = {
  title: "Pinoy Movies & TV 🇵🇭 | Mori",
  description: "Stream the best Filipino (Tagalog) movies and TV shows.",
};

const SORT_OPTIONS = [
  { value: "popularity.desc" as const, label: "Most Popular" },
  { value: "vote_average.desc" as const, label: "Highest Rated" },
  { value: "release_date.desc" as const, label: "Newest" },
];

export default async function PinoyPage({ searchParams }: PinoyPageProps) {
  const { page = "1", genre, sort = "popularity.desc" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const tmdb = TmdbService.getInstance();

  const [moviesResult, genresResult, tvResult] = await Promise.allSettled([
    tmdb.regional.discoverFilipinoMovies({
      sort_by: sort,
      with_genres: genre ? parseInt(genre, 10) : undefined,
      page: currentPage,
    }),
    tmdb.genres.getMovieGenres(),
    tmdb.regional.getFilipinoTV(),
  ]);

  const moviesData =
    moviesResult.status === "fulfilled" ? moviesResult.value : null;
  const genres: Genre[] =
    genresResult.status === "fulfilled" ? genresResult.value : [];
  const pinoyTV: TVShow[] =
    tvResult.status === "fulfilled" ? tvResult.value.results.slice(0, 12) : [];

  return (
    <div className="container-cine py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Pinoy Movies & TV <span className="text-primary">🇵🇭</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Stream the best Filipino movies and TV shows in Tagalog.
        </p>
      </div>

      {genres.length > 0 && (
        <GenreFilter
          genres={genres}
          activeGenre={genre}
          baseHref="/pinoy"
          currentSort={sort}
        />
      )}

      <div className="flex items-center justify-between py-4 border-b border-border">
        <p className="text-xs text-muted-foreground">
          {moviesData?.totalResults?.toLocaleString() || 0} movies found
        </p>
        <SelectSort
          options={SORT_OPTIONS}
          currentSort={sort}
          baseHref="/pinoy"
          genre={genre}
        />
      </div>

      {moviesData && moviesData.results.length > 0 && (
        <MediaGrid title="" items={moviesData.results} mediaType="movie" />
      )}

      {(!moviesData || moviesData.results.length === 0) && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No Pinoy movies found.</p>
        </div>
      )}

      {moviesData && moviesData.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={moviesData.totalPages}
          baseHref="/pinoy"
          searchParams={{
            genre: genre || "",
            sort: sort !== "popularity.desc" ? sort : "",
          }}
        />
      )}

      {/* Pinoy TV section (secondary, no pagination) */}
      {pinoyTV.length > 0 && (
        <div className="mt-12">
          <MediaGrid title="Pinoy TV Shows" items={pinoyTV} mediaType="tv" />
        </div>
      )}
    </div>
  );
}
