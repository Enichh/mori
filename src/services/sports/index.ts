// ---------------------------------------------------------------------------
// Mori ― Sports service facade
// ---------------------------------------------------------------------------
// This is the **only** import the rest of the application needs from the
// Sports layer.  It composes all sub-services behind a single entry-point.
// ---------------------------------------------------------------------------
import { SportsClient } from "./client";
import { SportEventsService, type ISportEventsService } from "./events";
import type { ICache } from "@/services/cache";

// Re-export interfaces so consumers only import from here
export type { ISportEventsService };

/**
 * Unified Sports service facade.
 *
 * Instantiate once (or use `getInstance`) and access sub-services via
 * the `.events` property.
 *
 * Dependencies are injected through the constructor following the
 * **Dependency Inversion Principle**.
 */
export class SportsService {
  readonly events: ISportEventsService;

  private static instance: SportsService;

  constructor(cache?: ICache) {
    const client = SportsClient.getInstance(cache);
    this.events = new SportEventsService(client);
  }

  /** Return (or create) the shared singleton. */
  static getInstance(cache?: ICache): SportsService {
    if (!SportsService.instance) {
      SportsService.instance = new SportsService(cache);
    }
    return SportsService.instance;
  }
}

// Also re-export the raw client for advanced use-cases
export { SportsClient } from "./client";
