import type { Metadata } from "next";
import { TmdbService } from "@/services/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { SelectSort } from "@/components/ui/select-sort";
import type { Genre } from "@/types";

export const revalidate = 3600;

interface AnimePageProps {
  searchParams: Promise<{ page?: string; genre?: string; sort?: string }>;
}

export const metadata: Metadata = {
  title: "Anime",
  description: "Stream the most popular anime series and movies.",
};

const SORT_OPTIONS = [
  { value: "popularity.desc" as const, label: "Most Popular" },
  { value: "vote_average.desc" as const, label: "Highest Rated" },
  { value: "first_air_date.desc" as const, label: "Newest" },
];

export default async function AnimePage({ searchParams }: AnimePageProps) {
  const { page = "1", genre, sort = "popularity.desc" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const tmdb = TmdbService.getInstance();

  let animeData = null;
  let genres: Genre[] = [];

  try {
    const [anime, animeGenres] = await Promise.all([
      tmdb.anime.getPopular(currentPage),
      tmdb.genres.getAnimeGenres(),
    ]);
    animeData = anime;
    genres = animeGenres;
  } catch (error) {
    console.error("Failed to fetch anime:", error);
  }

  return (
    <div className="container-cine py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Anime
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover the best anime from Japan and beyond.
        </p>
      </div>

      {genres.length > 0 && (
        <GenreFilter
          genres={genres}
          activeGenre={genre}
          baseHref="/anime"
          currentSort={sort}
        />
      )}

      <div className="flex items-center justify-between py-4 border-b border-border">
        <p className="text-xs text-muted-foreground">
          {animeData?.totalResults?.toLocaleString() || 0} anime found
        </p>
        <SelectSort
          options={SORT_OPTIONS}
          currentSort={sort}
          baseHref="/anime"
          genre={genre}
        />
      </div>

      {animeData && animeData.results.length > 0 && (
        <MediaGrid title="" items={animeData.results} mediaType="anime" />
      )}

      {(!animeData || animeData.results.length === 0) && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No anime found.</p>
        </div>
      )}

      {animeData && animeData.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={animeData.totalPages}
          baseHref="/anime"
          searchParams={{
            genre: genre || "",
            sort: sort !== "popularity.desc" ? sort : "",
          }}
        />
      )}
    </div>
  );
}
