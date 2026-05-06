// ---------------------------------------------------------------------------
// Mori ― Formatting / display utilities
// ---------------------------------------------------------------------------

/**
 * Convert a runtime in minutes to a human-readable string.
 * @example formatRuntime(135) → "2h 15m"
 */
export function formatRuntime(minutes: number): string {
  if (minutes <= 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format an ISO date string into a friendly short form.
 * @example formatDate("2024-01-15") → "Jan 15, 2024"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a vote average to one decimal place.
 * @example formatVoteAverage(7.543) → "7.5"
 */
export function formatVoteAverage(vote: number): string {
  return (Math.round(vote * 10) / 10).toFixed(1);
}

/**
 * Compact number formatting (e.g. 1.2K, 3.5M).
 * @example formatNumber(1200) → "1.2K"
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return String(num);
}

/**
 * Slugify a string for use in URLs.
 * @example slugify("Attack on Titan") → "attack-on-titan"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate a string to `maxLength` characters, appending `…` when needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}
