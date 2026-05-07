import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimeClient } from "./anime-client";

export const metadata: Metadata = {
  title: "Anime | Mori",
  description: "Discover and stream the best anime — powered by AniList.",
};

export default function AnimePage() {
  return (
    <Suspense
      fallback={
        <div className="container-cine py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
          </div>
        </div>
      }
    >
      <AnimeClient />
    </Suspense>
  );
}
