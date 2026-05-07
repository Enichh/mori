// ---------------------------------------------------------------------------
// Mori ― AniList service facade
// ---------------------------------------------------------------------------
import { AnilistClient } from "./client";
import { AnilistAnimeService } from "./anime";
import type { IAnilistAnimeService } from "./anime";

export { AnilistClient } from "./client";
export { AnilistAnimeService, type IAnilistAnimeService } from "./anime";

export class AnilistService {
  readonly anime: IAnilistAnimeService;
  private static instance: AnilistService;

  constructor() {
    const client = new AnilistClient();
    this.anime = new AnilistAnimeService(client);
  }

  static getInstance(): AnilistService {
    if (!AnilistService.instance) {
      AnilistService.instance = new AnilistService();
    }
    return AnilistService.instance;
  }
}
