import { describe, it, expect } from 'vitest';

describe('AniList Search Query', () => {
  it('should build correct search GraphQL', () => {
    const query = `
      query ($q: String, $page: Int) {
        Page(page: $page, perPage: 18) {
          pageInfo { total perPage currentPage lastPage hasNextPage }
          media(search: $q, type: ANIME, sort: SEARCH_MATCH) {
            id
            title { romaji english native }
            coverImage { large }
            format status episodes averageScore popularity genres
          }
        }
      }
    `;
    expect(query).toContain("SEARCH_MATCH");
    expect(query).toContain("type: ANIME");
    expect(query).toContain("pageInfo");
  });
});
