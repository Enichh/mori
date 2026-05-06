import type { Metadata } from "next";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { SelectSort } from "@/components/ui/select-sort";
import type { Genre } from "@/types";

export const revalidate = 3600;

interface MoviesPageProps {
  searchParams: Promise<{ page?: string; genre?: string; sort?: string }>;
}

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse and stream the latest movies in stunning quality.",
};

const SORT_OPTIONS = [
  { value: "popularity.desc" as const, label: "Most Popular" },
  { value: "vote_average.desc" as const, label: "Highest Rated" },
  { value: "release_date.desc" as const, label: "Newest" },
  { value: "revenue.desc" as const, label: "Highest Grossing" },
];

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { page = "1", genre, sort = "popularity.desc" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const tmdb = TmdbService.getInstance();

  let moviesData = null;
  let genres: Genre[] = [];

  try {
    const [movies, movieGenres] = await Promise.allSettled([
      genre
        ? tmdb.movies.getByGenre(parseInt(genre, 10), currentPage)
        : sort !== "popularity.desc"
          ? Promise.resolve(null) // fall through to discover via tmdb client
          : tmdb.movies.getPopular(currentPage),
      tmdb.genres.getMovieGenres(),
    ]);

    if (movies.status === "fulfilled") {
      moviesData = movies.value;
    }
    if (movieGenres.status === "fulfilled") {
      genres = movieGenres.value;
    }
  } catch (error) {
    console.error("Failed to fetch movies:", error);
  }

  return (
    <div className="container-cine py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Movies
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse and stream the latest blockbusters and timeless classics.
        </p>
      </div>

      {genres.length > 0 && (
        <GenreFilter
          genres={genres}
          activeGenre={genre}
          baseHref="/movies"
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
          baseHref="/movies"
          genre={genre}
        />
      </div>

      {moviesData && moviesData.results.length > 0 && (
        <MediaGrid title="" items={moviesData.results} mediaType="movie" />
      )}

      {(!moviesData || moviesData.results.length === 0) && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No movies found.</p>
        </div>
      )}

      {moviesData && moviesData.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={moviesData.totalPages}
          baseHref="/movies"
          searchParams={{
            genre: genre || "",
            sort: sort !== "popularity.desc" ? sort : "",
          }}
        />
      )}
    </div>
  );
}
