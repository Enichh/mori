// ---------------------------------------------------------------------------
// Mori ― Application constants
// ---------------------------------------------------------------------------

// ---- TMDB image base -----------------------------------------------------
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const IMAGE_SIZES = {
  poster: {
    w92: "w92",
    w154: "w154",
    w185: "w185",
    w342: "w342",
    w500: "w500",
    w780: "w780",
    original: "original",
  },
  backdrop: {
    w300: "w300",
    w780: "w780",
    w1280: "w1280",
    original: "original",
  },
  profile: {
    w45: "w45",
    w185: "w185",
    h632: "h632",
    original: "original",
  },
  still: {
    w92: "w92",
    w185: "w185",
    w300: "w300",
    original: "original",
  },
} as const;

// ---- Player --------------------------------------------------------------
export const VIDEO_SERVERS = {
  vidking: "Vidking",
  vidhide: "Vidhide",
  superembed: "SuperEmbed",
  "superembed-vip": "SuperEmbed VIP",
} as const;

export const DEFAULT_PLAYER_COLOR = "C5FF4A"; // lime green, no `#`

// ---- Anime ---------------------------------------------------------------
export const ANIME_GENRE_ID = 16;
export const ANIME_KEYWORD_ID = 210024;

// ---- Brand ---------------------------------------------------------------
export const SITE_NAME = "Mori";
export const SITE_DESCRIPTION =
  "Stream movies, TV shows, and anime. Powered by TMDB, Vidking & Vidhide.";

// ---- TMDB API ------------------------------------------------------------
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// ---- Vidking -------------------------------------------------------------
export const VIDKING_BASE_URL = "https://www.vidking.net";

// ---- Vidhide -------------------------------------------------------------
export const VIDHIDE_BASE_URL = "https://vidhide.com";
