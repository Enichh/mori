
import { Suspense } from "react";
import { WatchSportShell } from "./watch-sport-shell";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <WatchSportShell />
    </Suspense>
  );
}
