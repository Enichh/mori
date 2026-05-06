"use client";

import { useEffect, useRef } from "react";

/**
 * AdTerra Native Banner — uses the safe `useRef` + `appendChild` pattern
 * to avoid `document.write` which blanks Next.js pages on navigation.
 */
export function NativeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.firstChild) return;

    // Invoke script — loads the ad into #container-5c5604d861e766bf948b2109b8b3c63c
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://pl29360735.profitablecpmratenetwork.com/5c5604d861e766bf948b2109b8b3c63c/invoke.js";
    container.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center py-3">
      <div
        id="container-5c5604d861e766bf948b2109b8b3c63c"
        ref={containerRef}
        className="min-h-[90px] flex items-center justify-center"
      />
    </div>
  );
}
