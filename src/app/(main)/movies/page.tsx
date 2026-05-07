import type { Metadata } from "next";
import { Suspense } from "react";
import { MoviesClient } from "./movies-client";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse and stream the latest movies in stunning quality.",
};

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="container-cine py-20 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading movies...
          </p>
        </div>
      }
    >
      <MoviesClient />
    </Suspense>
  );
}
