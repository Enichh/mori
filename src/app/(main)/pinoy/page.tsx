import type { Metadata } from "next";
import { TmdbService } from "@/services/tmdb";
import { MediaHero } from "@/components/media/media-hero";
import { MediaGrid } from "@/components/media/media-grid";
import type { Movie, TVShow } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pinoy Movies & TV",
  description: "Stream the best Filipino (Tagalog) movies and TV shows.",
};

export default async function PinoyPage() {
  const tmdb = TmdbService.getInstance();

  let featuredMovie: Movie | null = null;
  let filipinoMovies: Movie[] = [];
  let filipinoTV: TVShow[] = [];
  const errors: string[] = [];

  try {
    const [moviesData, tvData] = await Promise.allSettled([
      tmdb.regional.getFilipinoMovies(),
      tmdb.regional.getFilipinoTV(),
    ]);

    if (moviesData.status === "fulfilled") {
      filipinoMovies = moviesData.value.results;
      featuredMovie = filipinoMovies[0] || null;
    } else {
      errors.push(`Movies: ${moviesData.reason}`);
    }

    if (tvData.status === "fulfilled") {
      filipinoTV = tvData.value.results;
    } else {
      errors.push(`TV: ${tvData.reason}`);
    }
  } catch (error) {
    console.error("Failed to fetch Pinoy content:", error);
    errors.push(String(error));
  }

  return (
    <div>
      {featuredMovie && <MediaHero media={featuredMovie} mediaType="movie" />}

      {!featuredMovie && (
        <section className="relative w-full min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card">
          <div className="container-cine text-center py-16">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Pinoy Movies & TV 🇵🇭
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Stream the best Filipino movies and TV shows in Tagalog.
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
              </div>
            )}
          </div>
        </section>
      )}

      <div className="container-cine py-8 space-y-10">
        {filipinoMovies.length > 0 && (
          <MediaGrid
            title="Pinoy Movies"
            items={filipinoMovies.slice(0, 18)}
            mediaType="movie"
          />
        )}

        {filipinoTV.length > 0 && (
          <MediaGrid
            title="Pinoy TV Shows"
            items={filipinoTV.slice(0, 18)}
            mediaType="tv"
          />
        )}

        {filipinoMovies.length === 0 && filipinoTV.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">
              No Filipino content found. Please try again later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
