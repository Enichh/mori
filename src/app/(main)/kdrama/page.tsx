import type { Metadata } from "next";
import { Suspense } from "react";
import { KDramaClient } from "./kdrama-client";

export const metadata: Metadata = {
  title: "KDrama | Mori",
  description: "Stream the most popular Korean dramas and TV shows.",
};

export default function KDramaPage() {
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
      <KDramaClient />
    </Suspense>
  );
}
