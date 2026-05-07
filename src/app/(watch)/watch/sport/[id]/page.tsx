import type { Metadata } from "next";
import { SportWatchClient } from "./sport-watch-client";

export const revalidate = 31536000; // 1 year — static shell, data is client-side

export const metadata: Metadata = {
  title: "Watch Sports | Mori",
  description: "Stream live sports events on Mori.",
};

export default function SportWatchPage() {
  return <SportWatchClient />;
}
