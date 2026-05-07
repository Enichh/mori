import type { Metadata } from "next";
import { SportWatchClient } from "./sport-watch-client";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Watch Sports | Mori",
  description: "Stream live sports events on Mori.",
};

export default function SportWatchPage() {
  return <SportWatchClient />;
}
