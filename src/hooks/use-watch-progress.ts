"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { saveWatchHistory } from "@/lib/watch-history";
import type { WatchProgress } from "@/types";

const PROGRESS_KEY_PREFIX = "mori:watch-progress:";

function buildKey(mediaId: number, mediaType: string): string {
  return `${PROGRESS_KEY_PREFIX}${mediaType}:${mediaId}`;
}

interface UseWatchProgressReturn {
  progress: WatchProgress | null;
  updateProgress: (currentTime: number, duration: number) => void;
  saveProgress: (entry: WatchProgress) => void;
  clearProgress: () => void;
}

export function useWatchProgress(
  mediaId: number,
  mediaType: "movie" | "tv",
): UseWatchProgressReturn {
  const key = buildKey(mediaId, mediaType);
  const [stored, setStored] = useLocalStorage<WatchProgress | null>(key, null);

  const [progress, setProgress] = useState<WatchProgress | null>(stored);

  // Sync from localStorage on mount
  useEffect(() => {
    setProgress(stored);
  }, [stored]);

  const updateProgress = useCallback(
    (currentTime: number, duration: number) => {
      const percentage =
        duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
      const newProgress: WatchProgress = {
        id: mediaId,
        mediaType,
        currentTime: Math.floor(currentTime),
        duration: Math.floor(duration),
        progress: percentage,
        updatedAt: Date.now(),
      };
      setStored(newProgress);
      setProgress(newProgress);
      // Also sync to the watch-history array (progress-only update)
      saveWatchHistory(newProgress);
    },
    [mediaId, mediaType, setStored],
  );

  /** Save a full entry (with poster/title) to the watch history array. */
  const saveProgress = useCallback(
    (entry: WatchProgress) => {
      setStored(entry);
      setProgress(entry);
      saveWatchHistory(entry);
    },
    [setStored],
  );

  const clearProgress = useCallback(() => {
    setStored(null);
    setProgress(null);
  }, [setStored]);

  // Listen for progress events from video players
  useEffect(() => {
    const handleProgressEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (
        detail &&
        detail.mediaId === mediaId &&
        detail.mediaType === mediaType
      ) {
        updateProgress(detail.currentTime, detail.duration);
      }
    };

    window.addEventListener("mori:watch-progress", handleProgressEvent);
    return () =>
      window.removeEventListener("mori:watch-progress", handleProgressEvent);
  }, [mediaId, mediaType, updateProgress]);

  return { progress, updateProgress, saveProgress, clearProgress };
}
