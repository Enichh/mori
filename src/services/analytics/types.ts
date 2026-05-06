// ---------------------------------------------------------------------------
// Mori ― Analytics types
// ---------------------------------------------------------------------------
import type { WatchProgress } from '@/types/player';

export type { WatchProgress };

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
}

export interface IAnalyticsService {
  saveProgress(progress: WatchProgress): void;
  getProgress(id: number, mediaType: string, season?: number, episode?: number): WatchProgress | null;
  getHistory(): WatchProgress[];
  clearHistory(): void;
}
