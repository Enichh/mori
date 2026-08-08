// ---------------------------------------------------------------------------
// Mori ― Watch history localStorage helpers
// ---------------------------------------------------------------------------
import type { WatchProgress } from "@/types";

const HISTORY_KEY = "mori:watch-history";
const MAX_ENTRIES = 20;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Read the full watch history array, newest first. */
export function getWatchHistory(): WatchProgress[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save (or update) a watch-history entry.
 *
 * - If an entry with the same `id` + `mediaType` already exists, its progress
 *   fields are updated in place and the entry is moved to the front.
 * - Otherwise a new entry is prepended.
 * - The list is capped at `MAX_ENTRIES`.
 */
export function saveWatchHistory(entry: WatchProgress): void {
  if (!isBrowser()) return;

  // Guard: reject entries with invalid ids (e.g. the ghost 0 from SSR)
  if (!entry.id || entry.id <= 0) return;

  const history = getWatchHistory();
  const existing = history.findIndex(
    (h) => h.id === entry.id && h.mediaType === entry.mediaType,
  );

  let updated: WatchProgress;
  if (existing !== -1) {
    // Merge new progress into stored entry, preserving display fields
    const old = history[existing];
    updated = {
      ...old,
      ...entry,
      posterPath: entry.posterPath ?? old.posterPath,
      title: entry.title ?? old.title,
      season: entry.season ?? old.season,
      episode: entry.episode ?? old.episode,
    };
    history.splice(existing, 1);
  } else {
    updated = entry;
  }

  history.unshift(updated);

  // Keep only the most recent MAX_ENTRIES, and strip any stale invalid entries
  const trimmed = history
    .filter((h) => h.id > 0)
    .slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    // Notify other components on the same tab
    if (isBrowser()) {
      window.dispatchEvent(new CustomEvent("mori:history-updated"));
    }
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Remove a single entry from watch history.
 */
export function removeWatchHistory(id: number, mediaType: string): void {
  if (!isBrowser()) return;
  const history = getWatchHistory();
  const filtered = history.filter(
    (h) => !(h.id === id && h.mediaType === mediaType),
  );
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    // Notify components so recommendations / watch history refresh
    if (isBrowser()) {
      window.dispatchEvent(new CustomEvent("mori:history-updated"));
    }
  } catch {
    // ignore
  }
}

/**
 * Clear the entire watch history.
 */
export function clearWatchHistory(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
