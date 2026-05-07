import type { Metadata } from "next";
import { SearchPageClient } from "./search-page-client";
import { InlineAd } from "@/components/ads/inline-ad";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for movies, TV shows, and anime to stream.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", type = "all" } = await searchParams;

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

      <SearchPageClient initialQuery={q} initialType={type} />
    </div>
  );
}
