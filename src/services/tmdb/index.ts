// ---------------------------------------------------------------------------
// Mori ― TMDB service facade
// ---------------------------------------------------------------------------
// This is the **only** import the rest of the application needs from the
// TMDB layer.  It composes all sub-services behind a single entry-point.
// ---------------------------------------------------------------------------
import { TmdbClient } from "./client";
import { MovieService, type IMovieService } from "./movies";
import { TVService, type ITVService } from "./tv";
import { AnimeService, type IAnimeService } from "./anime";
import { SearchService, type ISearchService } from "./search";
import { GenreService, type IGenreService } from "./genres";
import { RegionalService, type IRegionalService } from "./regional";
import type { ICache } from "@/services/cache";

// Re-export interfaces so consumers only import from here
export type {
  IMovieService,
  ITVService,
  IAnimeService,
  ISearchService,
  IGenreService,
  IRegionalService,
};

/**
 * Unified TMDB service facade.
 *
 * Instantiate once (or use `getInstance`) and access sub-services via
 * the `.movies`, `.tv`, `.anime`, `.search`, `.genres` properties.
 *
 * Dependencies are injected through the constructor following the
 * **Dependency Inversion Principle**.
 */
export class TmdbService {
  readonly movies: IMovieService;
  readonly tv: ITVService;
  readonly anime: IAnimeService;
  readonly search: ISearchService;
  readonly genres: IGenreService;
  readonly regional: IRegionalService;

  private static instance: TmdbService;

  constructor(apiKey?: string, cache?: ICache) {
    const client = TmdbClient.getInstance(apiKey, cache);
    this.movies = new MovieService(client);
    this.tv = new TVService(client);
    this.anime = new AnimeService(client);
    this.search = new SearchService(client);
    this.genres = new GenreService(client);
    this.regional = new RegionalService(client);
  }

  /** Return (or create) the shared singleton. */
  static getInstance(apiKey?: string, cache?: ICache): TmdbService {
    if (!TmdbService.instance) {
      TmdbService.instance = new TmdbService(apiKey, cache);
    }
    return TmdbService.instance;
  }
}

// Also re-export the raw client for advanced use-cases
export { TmdbClient } from "./client";
