// ---------------------------------------------------------------------------
// Mori ― Vidking player event handler (postMessage bridge)
// ---------------------------------------------------------------------------
import type { PlayerEvent, WatchProgress } from '@/types/player';

export type PlayerEventCallback = (event: PlayerEvent) => void;
export type ProgressCallback = (progress: WatchProgress) => void;

/**
 * Thin wrapper around the `window message` listener that the Vidking
 * iframe uses to report playback events.
 *
 * **Single responsibility**: parse raw `MessageEvent` → typed `PlayerEvent`,
 * then notify registered callbacks.
 */
export class VidkingEventService {
  private eventCallbacks: Set<PlayerEventCallback> = new Set();
  private progressCallbacks: Set<ProgressCallback> = new Set();
  private boundHandler: ((e: MessageEvent) => void) | null = null;

  /** Start listening for postMessage events on `window`. */
  listen(): void {
    if (this.boundHandler) return; // already listening
    this.boundHandler = this.handleMessage.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.boundHandler);
    }
  }

  /** Stop listening and clear all callbacks. */
  destroy(): void {
    if (this.boundHandler && typeof window !== 'undefined') {
      window.removeEventListener('message', this.boundHandler);
    }
    this.boundHandler = null;
    this.eventCallbacks.clear();
    this.progressCallbacks.clear();
  }

  /** Register a callback for every parsed player event. */
  onEvent(cb: PlayerEventCallback): () => void {
    this.eventCallbacks.add(cb);
    return () => this.eventCallbacks.delete(cb);
  }

  /** Register a callback that fires **only** on `timeupdate` events. */
  onProgress(cb: ProgressCallback): () => void {
    this.progressCallbacks.add(cb);
    return () => this.progressCallbacks.delete(cb);
  }

  // -- internals -----------------------------------------------------------

  private handleMessage(event: MessageEvent): void {
    const data = event.data;
    if (!data || data.type !== 'PLAYER_EVENT') return;

    const playerEvent: PlayerEvent = {
      type: 'PLAYER_EVENT',
      data: {
        event: data.data?.event ?? 'timeupdate',
        currentTime: data.data?.currentTime ?? 0,
        duration: data.data?.duration ?? 0,
        progress: data.data?.progress ?? 0,
        id: data.data?.id ?? '',
        mediaType: data.data?.mediaType ?? 'movie',
        season: data.data?.season,
        episode: data.data?.episode,
        timestamp: data.data?.timestamp ?? Date.now(),
      },
    };

    // Notify generic listeners
    for (const cb of this.eventCallbacks) {
      try {
        cb(playerEvent);
      } catch {
        // Swallow – one misbehaving callback shouldn't break others
      }
    }

    // Notify progress-specific listeners
    if (playerEvent.data.event === 'timeupdate') {
      const wp: WatchProgress = {
        id: Number(playerEvent.data.id),
        mediaType: playerEvent.data.mediaType,
        season: playerEvent.data.season,
        episode: playerEvent.data.episode,
        progress: playerEvent.data.progress,
        currentTime: playerEvent.data.currentTime,
        duration: playerEvent.data.duration,
        updatedAt: playerEvent.data.timestamp,
      };
      for (const cb of this.progressCallbacks) {
        try {
          cb(wp);
        } catch {
          // Swallow
        }
      }
    }
  }
}
