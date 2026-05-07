import type { Metadata } from "next";
import { Suspense } from "react";
import { PinoyClient } from "./pinoy-client";

export const metadata: Metadata = {
  title: "Pinoy Movies & TV | Mori",
  description: "Stream the best Filipino (Tagalog) movies and TV shows.",
};

export default function PinoyPage() {
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
      <PinoyClient />
    </Suspense>
  );
}
