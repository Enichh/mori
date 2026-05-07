import { describe, it, expect } from "vitest";
import { buildVidstreamUrl } from "@/services/vidstream";
import type { VidkingPlayerConfig } from "@/types/player";

describe("buildVidstreamUrl", () => {
  it("builds a movie URL with IMDB ID", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      imdbId: "tt40999028",
      mediaType: "movie",
    };

    const url = buildVidstreamUrl(config);

    expect(url).toBe("https://vidsrc.icu/embed/movie/tt40999028");
  });

  it("builds a movie URL with TMDB fallback when no IMDB ID", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      mediaType: "movie",
    };

    const url = buildVidstreamUrl(config);

    expect(url).toBe("https://vidsrc.icu/embed/movie/123");
  });

  it("builds a TV URL with IMDB ID, season, and episode", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      imdbId: "tt40999028",
      mediaType: "tv",
      season: 1,
      episode: 5,
    };

    const url = buildVidstreamUrl(config);

    expect(url).toBe("https://vidsrc.icu/embed/tv/tt40999028/1/5");
  });

  it("builds a TV URL with TMDB fallback when no IMDB ID", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 123,
      mediaType: "tv",
      season: 1,
      episode: 5,
    };

    const url = buildVidstreamUrl(config);

    expect(url).toBe("https://vidsrc.icu/embed/tv/123/1/5");
  });

  it("uses IMDB ID even when both IDs are provided", () => {
    const config: VidkingPlayerConfig = {
      tmdbId: 444,
      imdbId: "tt40999028",
      mediaType: "movie",
    };

    const url = buildVidstreamUrl(config);

    expect(url).toBe("https://vidsrc.icu/embed/movie/tt40999028");
    expect(url).not.toContain("444");
  });
});
