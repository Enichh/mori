"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "TV", href: "/tv" },
  { label: "Anime", href: "/anime" },
  { label: "Pinoy Movies", href: "https://silip.pages.dev", external: true },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-13 pb-1">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const linkClass = cn(
            "relative flex items-center justify-center min-w-0 flex-1 py-3",
            "transition-colors duration-200",
            isActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          );

          if ("external" in item && item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <span className="text-xs font-body font-medium tracking-wider uppercase">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={linkClass}>
              <span className="text-xs font-body font-medium tracking-wider uppercase">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
