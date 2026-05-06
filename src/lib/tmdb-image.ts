// ---------------------------------------------------------------------------
// Mori ― TMDB image URL helpers
// ---------------------------------------------------------------------------
import { TMDB_IMAGE_BASE_URL, IMAGE_SIZES } from "./constants";

const PLACEHOLDER_POSTER =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="342" height="513" fill="%231A1A1A"><rect width="342" height="513"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-family="sans-serif" font-size="18">No Image</text></svg>`,
  );

const PLACEHOLDER_BACKDROP =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" fill="%231A1A1A"><rect width="1280" height="720"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-family="sans-serif" font-size="24">No Image</text></svg>`,
  );

const PLACEHOLDER_PROFILE =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="185" height="185" fill="%231A1A1A"><circle cx="92.5" cy="70" r="30" fill="%23888"/><ellipse cx="92.5" cy="160" rx="45" ry="30" fill="%23888"/></svg>`,
  );

// ---- public API ----------------------------------------------------------

/** Build a poster URL. Returns an inline SVG placeholder when `path` is null. */
export function getPosterUrl(
  path: string | null,
  size: string = IMAGE_SIZES.poster.w342,
): string {
  if (!path) return PLACEHOLDER_POSTER;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/** Build a backdrop URL. Returns an inline SVG placeholder when `path` is null. */
export function getBackdropUrl(
  path: string | null,
  size: string = IMAGE_SIZES.backdrop.w1280,
): string {
  if (!path) return PLACEHOLDER_BACKDROP;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/** Build a profile photo URL. Returns an inline SVG placeholder when `path` is null. */
export function getProfileUrl(
  path: string | null,
  size: string = IMAGE_SIZES.profile.w185,
): string {
  if (!path) return PLACEHOLDER_PROFILE;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/** Build a still (episode image) URL. Returns an inline SVG placeholder when `path` is null. */
export function getStillUrl(
  path: string | null,
  size: string = IMAGE_SIZES.still.w300,
): string {
  if (!path) return PLACEHOLDER_BACKDROP;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}
