// ---------------------------------------------------------------------------
// Mori ― Site configuration
// ---------------------------------------------------------------------------
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_PLAYER_COLOR,
} from "@/lib/constants";

export const siteConfig = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  theme: {
    background: "#000000",
    foreground: "#FFFFFF",
    primary: `#${DEFAULT_PLAYER_COLOR}`, // #C5FF4A
  },
  links: {
    github: "https://github.com",
  },
  player: {
    defaultServer: "vidking" as const,
    color: DEFAULT_PLAYER_COLOR,
  },
  features: {
    watchHistory: true,
    continueWatching: true,
    animeSection: true,
  },
} as const;
