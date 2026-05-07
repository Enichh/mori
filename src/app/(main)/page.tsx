import type { Metadata } from "next";
import { HomeClient } from "./home-client";

export const metadata: Metadata = {
  title: {
    default: "Mori — Watch Free Movies, TV Shows & Anime Online in HD",
    template: "%s",
  },
  description:
    "Stream free movies, TV shows, anime, Pinoy teleserye & KDrama online in HD. No sign-up. Watch now on Mori.",
};

export default function HomePage() {
  return <HomeClient />;
}
