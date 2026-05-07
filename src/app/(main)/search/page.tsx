import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "./search-page-client";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for movies, TV shows, and anime to stream.",
};

export default function SearchPage() {
  return (
    <div className="container-cine py-8 min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Find movies, TV shows, and anime to stream.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-20 text-center text-muted-foreground">
            Loading search...
          </div>
        }
      >
        <SearchPageClient />
      </Suspense>
    </div>
  );
}
