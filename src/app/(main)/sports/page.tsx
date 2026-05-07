import type { Metadata } from "next";
import { SportsClient } from "./sports-client";

export const metadata: Metadata = {
  title: "Live Sports | Mori",
  description:
    "Stream live sports from around the world — basketball, football, baseball, hockey, MMA, tennis, golf, cricket, and more.",
};

export default function SportsPage() {
  return <SportsClient />;
}
