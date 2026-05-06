"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Film, Tv, Swords, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "@/config/navigation";

const iconMap: Record<string, LucideIcon> = {
  House,
  Film,
  Tv,
  Swords,
  Search,
};

export function MobileNav() {
  const pathname = usePathname();

  // Hide on desktop
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon ? iconMap[item.icon] : null;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-1",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "drop-shadow-[0_0_8px_rgba(197,255,74,0.5)]",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              <span className="text-[10px] font-body font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
