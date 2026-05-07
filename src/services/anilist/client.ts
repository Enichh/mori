// ---------------------------------------------------------------------------
// Mori ― AniList GraphQL client
// ---------------------------------------------------------------------------
import { ANILIST_BASE_URL } from "@/lib/constants";

export class AnilistClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? ANILIST_BASE_URL;
  }

  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(`AniList ${res.status}: ${await res.text().then(t => t.slice(0, 200))}`);
    }
    const json = await res.json();
    if (json.errors) {
      throw new Error(json.errors[0]?.message ?? "AniList GraphQL error");
    }
    return json.data as T;
  }
}
