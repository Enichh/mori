import type { Metadata } from "next";
import { Suspense } from "react";
import { KDramaClient } from "./kdrama-client";

export const metadata: Metadata = {
  title: "Drama | Mori",
  description: "Stream the most popular Asian dramas and TV shows.",
};

export default function DramaPage() {
  return (
    <Suspense>
      <KDramaClient />
    </Suspense>
  );
}
