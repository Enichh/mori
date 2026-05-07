"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NativeBanner, CONTAINER_ID } from "@/components/ads/native-banner";

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const barRef = React.useRef<HTMLDivElement>(null);

  // Show the back bar on mouse-near-top OR on touch near the top 80px
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setVisible(e.clientY < 60);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        setVisible(touch.clientY < 80);
      }
    };

    const handleTouchEnd = () => {
      // Hide after 2.5s of no touch
      setTimeout(() => setVisible(false), 2500);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // Derive the "back to browse" URL from the current path
  const backHref = React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "watch" && parts[1]) {
      const type = parts[1];
      const id = parts[2];
      if (type === "movie") return `/movies/${id}`;
      if (type === "tv") return `/tv/${id}`;
      if (type === "anime") return `/anime/${id}`;
      if (type === "sport") return `/sports`;
    }
    return "/";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Immersive top bar — fades in on mouse/touch-at-top */}
      <div
        ref={barRef}
        className={`fixed top-0 left-0 right-0 z-50 h-12 bg-gradient-to-b from-black/90 to-transparent flex items-center px-4 transition-opacity duration-300 ${
          visible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors font-body"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Back to details</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col">{children}</div>

      {/* Subtle ad below the watch experience — uses its own container ID */}
      <NativeBanner
        containerId={CONTAINER_ID}
        variant="compact"
        label=""
        className="bg-black/80 border-t border-white/5 py-3 sm:py-4"
      />
    </div>
  );
}
