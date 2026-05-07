import { describe, it, expect } from "vitest";
import { buildVidplayUrl } from "@/services/vidplay";
import type { VidkingPlayerConfig } from "@/types/player";

describe("buildVidplayUrl", () => {
  it("builds a movie URL with IMDB ID", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      imdbId: "tt40999028",
      mediaType: "movie",
    };

    const url = buildVidplayUrl(config);

    expect(url).toBe(
      "https://vidsrc.cc/v2/embed/movie/tt40999028?autoPlay=false",
    );
  });

  it("builds a movie URL with TMDB fallback when no IMDB ID", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      mediaType: "movie",
    };

    const url = buildVidplayUrl(config);

    expect(url).toBe("https://vidsrc.cc/v2/embed/movie/123?autoPlay=false");
  });

  it("builds a TV URL with IMDB ID, season, and episode", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      imdbId: "tt40999028",
      mediaType: "tv",
      season: 1,
      episode: 5,
    };

    const url = buildVidplayUrl(config);

    expect(url).toBe(
      "https://vidsrc.cc/v2/embed/tv/tt40999028/1/5?autoPlay=false",
    );
  });

  it("builds a TV URL with TMDB fallback when no IMDB ID", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      mediaType: "tv",
      season: 1,
      episode: 5,
    };

    const url = buildVidplayUrl(config);

    expect(url).toBe(
      "https://vidsrc.cc/v2/embed/tv/123/1/5?autoPlay=false",
    );
  });

  it("always includes ?autoPlay=false", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      imdbId: "tt40999028",
      mediaType: "movie",
    };

    const url = buildVidplayUrl(config);

    expect(url).toContain("?autoPlay=false");
  });
});
