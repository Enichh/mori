import { TmdbService } from "@/services/tmdb";
import { AnilistService } from "@/services/anilist";
import { MediaHero } from "@/components/media/media-hero";
import { MediaGrid } from "@/components/media/media-grid";
import { WatchHistory } from "@/components/media/watch-history";
import type { Movie, TVShow } from "@/types";

export const revalidate = 86400;

export default async function HomePage() {
  const tmdb = TmdbService.getInstance();

  let featuredMovie: Movie | null = null;
  let trendingMovies: Movie[] = [];
  let trendingTV: TVShow[] = [];
  let popularAnime: TVShow[] = [];
  let filipinoMovies: Movie[] = [];
  const errors: string[] = [];

  try {
    const anilist = AnilistService.getInstance();
    const [movieData, tvData, animeData, pinoyData] = await Promise.allSettled([
      tmdb.movies.getTrending("day"),
      tmdb.tv.getTrending("week"),
      anilist.anime.getTrending(),
      tmdb.regional.getFilipinoMovies(),
    ]);

    if (movieData.status === "fulfilled") {
      trendingMovies = movieData.value.results.slice(0, 12);
      featuredMovie = trendingMovies[0] || null;
    } else {
      errors.push(`Movies: ${movieData.reason}`);
    }

    if (tvData.status === "fulfilled") {
      trendingTV = tvData.value.results.slice(0, 12);
    } else {
      errors.push(`TV: ${tvData.reason}`);
    }

    if (animeData.status === "fulfilled") {
      popularAnime = animeData.value.results.slice(0, 12).map((a) => ({
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
      })) as any;
    } else {
      errors.push(`Anime: ${animeData.reason}`);
    }

    if (pinoyData.status === "fulfilled") {
      filipinoMovies = pinoyData.value.results.slice(0, 12);
    } else {
      errors.push(`Pinoy Movies: ${pinoyData.reason}`);
    }
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    errors.push(String(error));
  }

  return (
    <div>
      {/* ---- Hero Section ---- */}
      {featuredMovie && <MediaHero media={featuredMovie} mediaType="movie" />}

      {!featuredMovie && (
        <section className="relative w-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card">
          <div className="container-cine text-center py-20">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Welcome to <span className="text-primary">Mori</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Stream the latest Movies, TV Shows, and Anime in stunning quality.
            </p>
            {errors.length > 0 && (
              <div className="terminal-box max-w-lg mx-auto text-left mt-6">
                <p className="text-destructive/80 text-xs mb-2">
                  ⚠ Debug info:
                </p>
                {errors.map((err, i) => (
                  <p
                    key={i}
                    className="text-muted-foreground text-xs font-mono break-all"
                  >
                    {err}
                  </p>
                ))}
                <p className="text-muted-foreground/50 text-xs mt-2">
                  Tip: Make sure TMDB_API_KEY is set in .env.local and you
                  restarted the dev server after adding it.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---- Marquee Ticker ---- */}
      <section className="marquee-ticker">
        <div className="marquee-ticker-content">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-7 pr-7">
              <span className="text-[11px] tracking-[0.18em] text-primary uppercase font-body">
                {i % 2 === 0 ? "Trending Now" : "New Releases"}
              </span>
              <span className="text-[rgb(61,61,61)] text-xs">✕</span>
            </span>
          ))}
        </div>
      </section>

      {/* ---- Continue Watching (client component) ---- */}
      <WatchHistory maxItems={8} />

      {/* ---- Content Grids ---- */}
      <div className="container-cine space-y-10 sm:space-y-12 py-8 sm:py-10">
        {trendingMovies.length > 0 && (
          <MediaGrid
            title="Trending Movies"
            items={trendingMovies}
            mediaType="movie"
            viewAllHref="/movies"
          />
        )}

        {/* Inline ad between movie and TV sections — shows on all screen sizes */}
        {trendingTV.length > 0 && (
          <MediaGrid
            title="Trending TV Shows"
            items={trendingTV}
            mediaType="tv"
            viewAllHref="/tv"
          />
        )}

        {/* Inline ad between TV and anime sections — desktop only to avoid stacking */}
        {popularAnime.length > 0 && (
          <MediaGrid
            title="Popular Anime"
            items={popularAnime}
            mediaType="anime"
            viewAllHref="/anime"
          />
        )}

        {filipinoMovies.length > 0 && (
          <MediaGrid
            title="Pinoy Movies 🇵🇭"
            items={filipinoMovies}
            mediaType="movie"
            viewAllHref="/pinoy"
          />
        )}
      </div>

      {/* ---- Footer ASCII Art ---- */}
      <section className="py-12">
        <div className="container-cine">
          <div className="terminal-box text-center">
            <pre className="ascii-art text-primary/25 pointer-events-none">
              {`  ╔══════════════════════════════════════════════╗
  ║    ███╗   ███╗ ██████╗ ██████╗ ██╗          ║
  ║    ████╗ ████║██╔═══██╗██╔══██╗██║          ║
  ║    ██╔████╔██║██║   ██║██████╔╝██║          ║
  ║    ██║╚██╔╝██║██║   ██║██╔══██╗██║          ║
  ║    ██║ ╚═╝ ██║╚██████╔╝██║  ██║██║          ║
  ║    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝          ║
  ║  zkPass-inspired · TMDB · Vidking · Vidhide  ║
  ╚══════════════════════════════════════════════╝`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
