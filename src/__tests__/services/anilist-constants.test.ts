// ---------------------------------------------------------------------------
// Mori ― AniList & Anime Stream constants tests
// ---------------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { ANILIST_BASE_URL, ANIME_STREAM_BASE_URL } from "@/lib/constants";

describe("AniList & Anime Stream Constants", () => {
  it("ANILIST_BASE_URL should be GraphQL endpoint", () => {
    expect(ANILIST_BASE_URL).toBe("https://graphql.anilist.co");
  });

  it("ANIME_STREAM_BASE_URL should be set", () => {
    expect(ANIME_STREAM_BASE_URL).toBeTruthy();
  });
});
