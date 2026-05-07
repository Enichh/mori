// ---------------------------------------------------------------------------
// Mori ― AniList service & client tests
// ---------------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { AnilistClient } from "@/services/anilist/client";
import { AnilistAnimeService } from "@/services/anilist/anime";

describe("AniList Client", () => {
  it("should create a client with default URL", () => {
    const client = new AnilistClient();
    expect(client).toBeDefined();
  });

  it("should create a client with custom URL", () => {
    const client = new AnilistClient("https://custom.url");
    expect(client).toBeDefined();
  });
});

describe("AniList Anime Service", () => {
  it("should instantiate with a client", () => {
    const client = new AnilistClient();
    const service = new AnilistAnimeService(client);
    expect(service).toBeDefined();
  });

  it("should have all expected methods", () => {
    const client = new AnilistClient();
    const service = new AnilistAnimeService(client);
    expect(typeof service.getTrending).toBe("function");
    expect(typeof service.getPopular).toBe("function");
    expect(typeof service.getTopRated).toBe("function");
    expect(typeof service.getThisSeason).toBe("function");
    expect(typeof service.getDetails).toBe("function");
    expect(typeof service.search).toBe("function");
    expect(typeof service.discover).toBe("function");
  });

  it("should correctly map anime results", () => {
    const client = new AnilistClient();
    const service = new AnilistAnimeService(client);
    const rawData = {
      id: 1,
      title: { romaji: "Test Anime", english: "Test ENG", native: "テスト" },
      coverImage: {
        large: "https://example.com/large.jpg",
        medium: "https://example.com/medium.jpg",
      },
      bannerImage: "https://example.com/banner.jpg",
      format: "TV",
      status: "FINISHED",
      episodes: 12,
      averageScore: 85,
      popularity: 1000,
      genres: ["Action", "Comedy"],
      tags: [{ name: "school" }],
      studios: { nodes: [{ name: "Studio X" }] },
      nextAiringEpisode: null,
      season: "SPRING",
      seasonYear: 2024,
    };

    // Access the private mapper via prototype
    const mapped = (service as any).mapAnimeResult(rawData);
    expect(mapped.id).toBe(1);
    expect(mapped.title).toBe("Test ENG");
    expect(mapped.episodes).toBe(12);
    expect(mapped.averageScore).toBe(85);
    expect(mapped.genres).toEqual(["Action", "Comedy"]);
    expect(mapped.studios).toEqual(["Studio X"]);
  });
});

describe("AniList Service Facade", () => {
  it("should be importable", async () => {
    const { AnilistService } = await import("@/services/anilist");
    expect(AnilistService).toBeDefined();
    expect(typeof AnilistService.getInstance).toBe("function");
  });
});
