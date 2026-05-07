// ---------------------------------------------------------------------------
// Mori ― Vidhide embed helpers
// ---------------------------------------------------------------------------
import type { VidhideSource } from "@/types/player";

/**
 * Build an `<iframe>` HTML string for a Vidhide video source.
 */
export function buildVidhideIframe(
  source: VidhideSource,
  width = "100%",
  height = "100%",
): string {
  const embedUrl = source.url.includes("/v/")
    ? source.url
    : source.url.replace(/\/(embed|d)\//, "/v/");

  return [
    `<iframe`,
    `  src="${embedUrl}"`,
    `  width="${width}"`,
    `  height="${height}"`,
    `  frameborder="0"`,
    `  allow="autoplay; fullscreen"`,
    `  allowfullscreen`,
    `  referrerpolicy="no-referrer"`,
    `></iframe>`,
  ].join("\n");
}

/**
 * Build an `<iframe>` HTML string from a raw Vidhide URL string.
 */
export function buildVidhideIframeFromUrl(
  url: string,
  width = "100%",
  height = "100%",
): string {
  const embedUrl = url.includes("/v/")
    ? url
    : url.replace(/\/(embed|d)\//, "/v/");
  return [
    `<iframe`,
    `  src="${embedUrl}"`,
    `  width="${width}"`,
    `  height="${height}"`,
    `  frameborder="0"`,
    `  allow="autoplay; fullscreen"`,
    `  allowfullscreen`,
    `  referrerpolicy="no-referrer"`,
    `></iframe>`,
  ].join("\n");
}

/**
 * Pick the best quality source from a list.
 * Prefers 1080p → 720p → 480p → first available.
 */
export function pickBestSource(sources: VidhideSource[]): VidhideSource | null {
  if (sources.length === 0) return null;
  const qualityRank: Record<string, number> = {
    "2160p": 6,
    "1440p": 5,
    "1080p": 4,
    "720p": 3,
    "480p": 2,
    "360p": 1,
  };
  let best = sources[0];
  let bestRank = 0;
  for (const s of sources) {
    const q = s.quality.toLowerCase().replace(" ", "");
    const rank = qualityRank[q] ?? 0;
    if (rank > bestRank) {
      bestRank = rank;
      best = s;
    }
  }
  return best;
}
