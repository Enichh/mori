"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { AD_CONFIG } from "@/config/ads";

/**
 * NativeBanner — Single native banner ad unit.
 *
 * Uses the safe `useRef` + `appendChild` pattern to avoid `document.write`
 * which blanks Next.js pages on navigation.
 *
 * Placed in:
 *   - Main layout (below header) — all browsing pages
 *   - Watch layout (bottom of page) — all watch pages
 */
interface NativeBannerProps {
  containerId?: string;
  scriptSrc?: string;
  variant?: "banner" | "compact";
  label?: string;
  className?: string;
}

export const CONTAINER_ID = AD_CONFIG.nativeBanner.containerId;
const SCRIPT_SRC = AD_CONFIG.nativeBanner.scriptSrc;

export function NativeBanner({
  containerId = CONTAINER_ID,
  scriptSrc = SCRIPT_SRC,
  variant = "banner",
  label = "Advertisement",
  className,
}: NativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.firstChild) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = scriptSrc;
    container.appendChild(script);
  }, [scriptSrc]);

  const sizeClasses = {
    banner: "min-h-[60px] sm:min-h-[90px] w-full max-w-full sm:max-w-[728px]",
    compact: "min-h-[50px] sm:min-h-[60px] w-full max-w-full sm:max-w-[468px]",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center px-4 sm:px-0",
        "py-2 sm:py-3",
        className,
      )}
    >
      {label && (
        <span className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40 mb-1.5 sm:mb-2 select-none font-body">
          {label}
        </span>
      )}
      <div
        id={containerId}
        ref={containerRef}
        className={cn(
          "flex items-center justify-center mx-auto overflow-hidden",
          sizeClasses[variant],
        )}
      />
    </div>
  );
}
