// ---------------------------------------------------------------------------
// Mori ― Watch-progress analytics (localStorage)
// ---------------------------------------------------------------------------
import type { WatchProgress } from '@/types/player';
import type { IAnalyticsService } from './types';

const STORAGE_KEY = 'mori:watch-history';
const MAX_HISTORY = 100;

/**
 * Client-side watch-progress tracker.
 *
 * Persists playback position to `localStorage` so users can resume
 * where they left off.  Implements the `IAnalyticsService` interface.
 *
 * **Note**: This is intentionally a client-only service.  Import it
 * only in components that are guaranteed to run in the browser.
 */
export class AnalyticsService implements IAnalyticsService {
  private get store(): Storage | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  }

  /** Persist (or update) watch progress for a given media item. */
  saveProgress(progress: WatchProgress): void {
    if (!this.store) return;
    const history = this.getHistoryRaw();

    // Remove any existing entry for this exact id + mediaType + (optional) season/episode
    const idx = history.findIndex(
      (p) =>
        p.id === progress.id &&
        p.mediaType === progress.mediaType &&
        (progress.mediaType === 'movie' ||
          (p.season === progress.season && p.episode === progress.episode)),
    );
    if (idx !== -1) history.splice(idx, 1);

    // Prepend to keep most recent first
    history.unshift(progress);

    // Trim
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }

    this.saveHistoryRaw(history);
  }

  /**
   * Retrieve the last-saved progress for a given media item.
   * Returns `null` if no progress has been saved.
   */
  getProgress(
    id: number,
    mediaType: string,
    season?: number,
    episode?: number,
  ): WatchProgress | null {
    if (!this.store) return null;
    const history = this.getHistoryRaw();
    if (mediaType === 'movie') {
      return history.find((p) => p.id === id && p.mediaType === 'movie') ?? null;
    }
    return (
      history.find(
        (p) =>
          p.id === id &&
          p.mediaType === 'tv' &&
          p.season === season &&
          p.episode === episode,
      ) ?? null
    );
  }

  /** Return the full watch history (most recent first). */
  getHistory(): WatchProgress[] {
    return this.getHistoryRaw();
  }

  /** Wipe all saved progress. */
  clearHistory(): void {
    if (!this.store) return;
    this.store.removeItem(STORAGE_KEY);
  }

  // -- internal ------------------------------------------------------------

  private getHistoryRaw(): WatchProgress[] {
    if (!this.store) return [];
    try {
      const raw = this.store.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as WatchProgress[];
    } catch {
      return [];
    }
  }

  private saveHistoryRaw(history: WatchProgress[]): void {
    if (!this.store) return;
    try {
      this.store.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // localStorage may be full – silently ignore
    }
  }
}
