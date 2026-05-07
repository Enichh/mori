import type { Metadata } from "next";
import { AnilistService } from "@/services/anilist";
import { MediaGrid } from "@/components/media/media-grid";
import { GenreFilter } from "@/components/ui/genre-filter";
import { Pagination } from "@/components/ui/pagination";
import { SelectSort } from "@/components/ui/select-sort";
import type { Genre } from "@/types";

export const revalidate = 86400;

interface AnimePageProps {
  searchParams: Promise<{ page?: string; genre?: string; sort?: string }>;
}

export const metadata: Metadata = {
  title: "Anime | Mori",
  description: "Discover and stream the best anime — powered by AniList.",
};

const SORT_OPTIONS = [
  { value: "TRENDING_DESC" as const, label: "Trending" },
  { value: "POPULARITY_DESC" as const, label: "Most Popular" },
  { value: "SCORE_DESC" as const, label: "Highest Rated" },
  { value: "START_DATE_DESC" as const, label: "Newest" },
];

// Map AniList string genres to { id, name } format for GenreFilter
const GENRES: Genre[] = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
  "Mecha",
  "Music",
  "Ecchi",
].map((name, i) => ({ id: i + 1, name }));

export default async function AnimePage({ searchParams }: AnimePageProps) {
  const { page = "1", genre, sort = "TRENDING_DESC" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const anilist = AnilistService.getInstance();

  // Map genre index back to string name
  const genreName = genre
    ? GENRES.find((g) => String(g.id) === genre)?.name
    : undefined;

  let animeData = null;
  try {
    animeData = await anilist.anime.discover({
      sort: sort as any,
      genre: genreName,
      page: currentPage,
    });
  } catch (e) {
    console.error("Failed to fetch anime:", e);
  }

  // Convert AniList results to Anime-shaped items for MediaGrid
  const mediaItems =
    animeData?.results.map((a) => ({
      id: a.id,
      mediaType: "anime" as const,
      title: a.title,
      name: a.title,
      originalName: a.nativeTitle,
      overview: a.description,
      posterPath: a.coverImage,
      backdropPath: a.bannerImage,
      voteAverage: a.averageScore ? a.averageScore / 10 : 0,
      voteCount: a.popularity,
      genreIds: [],
      popularity: a.popularity,
      originalLanguage: "ja",
      adult: false,
      firstAirDate: a.seasonYear ? `${a.seasonYear}-01-01` : "",
      lastAirDate: "",
      numberOfSeasons: 1,
      numberOfEpisodes: a.episodes ?? 0,
      status: a.status,
      seasons: [],
      credits: { cast: [], crew: [] },
      similar: { page: 1, results: [], totalPages: 1, totalResults: 0 },
      videos: { results: [] },
      nextEpisodeToAir: null,
    })) || [];

  return (
    <div className="container-cine py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Anime
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover the best anime from Japan and beyond — powered by AniList.
        </p>
      </div>

      <GenreFilter
        genres={GENRES}
        activeGenre={genre}
        baseHref="/anime"
        currentSort={sort}
      />

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

      {mediaItems.length > 0 && (
        <MediaGrid title="" items={mediaItems} mediaType="anime" />
      )}

      {mediaItems.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No anime found.</p>
        </div>
      )}

      {/* In-content ad — subtle separator before pagination */}
      {animeData && animeData.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={animeData.totalPages}
          baseHref="/anime"
          searchParams={{
            genre: genre || "",
            sort: sort !== "TRENDING_DESC" ? sort : "",
          }}
        />
      )}
    </div>
  );
}
