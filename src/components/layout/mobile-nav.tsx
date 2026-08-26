"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Film,
  Tv,
  Library,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { browseNavItems } from "@/config/navigation";

/** Icon map keyed by the `icon` string in navigation config. */
const ICONS: Record<string, LucideIcon> = {
  Home,
  Film,
  Tv,
  Library,
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around h-16">
        {browseNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = ICONS[item.icon ?? "Home"] ?? Home;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 gap-1 min-w-0",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center h-[28px] px-3 rounded-full transition-colors",
                  isActive && "bg-primary/15",
                )}
              >
                <Icon className="h-[20px] w-[20px]" />
              </span>
              <span className="text-[10px] font-body font-medium tracking-wider uppercase">
                {item.label === "TV Shows" ? "TV" : item.label === "Collections" ? "Library" : item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
