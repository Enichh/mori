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
  vidking: "Faye",
  vidlink: "Luna",
  superembed: "Eden",
  consumet: "1Anime",
} as const;

export const DEFAULT_PLAYER_COLOR = "C5FF4A";

// ---- Anime ---------------------------------------------------------------
export const ANIME_GENRE_ID = 16;
export const ANIME_KEYWORD_ID = 210024;

// ---- Brand ---------------------------------------------------------------
export const SITE_NAME = "Mori";
export const SITE_DESCRIPTION = "Stream movies, TV shows, and anime.";

// ---- TMDB API ------------------------------------------------------------
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// ---- AniList --------------------------------------------------------------
export const ANILIST_BASE_URL = "/api/anilist";

// ---- Vidking -------------------------------------------------------------
export const VIDKING_BASE_URL = "https://www.vidking.net";

// ---- Anime Stream (1Anime CDN) -------------------------------------------
export const ANIME_STREAM_BASE_URL = "/api/1anime";

// ---- VidLink -------------------------------------------------------------
export const VIDLINK_BASE_URL = "https://vidlink.pro";

// ---- Sports API ----------------------------------------------------------
export const SPORTS_CDNLIVE_BASE_URL = "/api/sports";
