"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);

  // Show the back bar when the mouse is near the top 60px
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setVisible(e.clientY < 60);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Derive the "back to browse" URL from the current path
  const backHref = React.useMemo(() => {
    // /watch/movie/123 → /movies/123
    // /watch/tv/123/1/1 → /tv/123
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "watch" && parts[1]) {
      const type = parts[1]; // "movie" or "tv"
      const id = parts[2];
      if (type === "movie") return `/movies/${id}`;
      if (type === "tv") return `/tv/${id}`;
    }
    return "/";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-black">
      {/* Immersive top bar — fades in on mouse-at-top */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 h-12 bg-gradient-to-b from-black/90 to-transparent flex items-center px-4 transition-opacity duration-300 ${
          visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to details</span>
        </Link>
      </div>

      {children}
    </div>
  );
}
