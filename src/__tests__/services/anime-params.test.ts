// ---------------------------------------------------------------------------
// Mori ― Anime service base params tests
// ---------------------------------------------------------------------------
// The anime discover queries rely on specific TMDB genre and keyword IDs.
// These tests lock down those values so they never change accidentally.
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { ANIME_GENRE_ID, ANIME_KEYWORD_ID } from "@/lib/constants";

describe("Anime Service ― base params", () => {
  it("ANIME_GENRE_ID should be 16 (TMDB Animation genre)", () => {
    expect(ANIME_GENRE_ID).toBe(16);
  });

  it("ANIME_KEYWORD_ID should be 210024 (anime keyword)", () => {
    expect(ANIME_KEYWORD_ID).toBe(210024);
  });

  it("ANIME_GENRE_ID should be a positive integer", () => {
    expect(Number.isInteger(ANIME_GENRE_ID)).toBe(true);
    expect(ANIME_GENRE_ID).toBeGreaterThan(0);
  });

  it("ANIME_KEYWORD_ID should be a positive integer", () => {
    expect(Number.isInteger(ANIME_KEYWORD_ID)).toBe(true);
    expect(ANIME_KEYWORD_ID).toBeGreaterThan(0);
  });
});
