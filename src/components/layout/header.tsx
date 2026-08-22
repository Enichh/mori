"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Heart,
  MessageSquare,
  ExternalLink,
  Swords,
  BookOpen,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  browseNavItems,
  actionNavItems,
  sisterNavItems,
} from "@/config/navigation";

const ACTION_ICONS: Record<string, LucideIcon> = {
  Heart,
  MessageSquare,
};

const SISTER_ICONS: Record<string, LucideIcon> = {
  Swords,
  BookOpen,
  Globe,
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-md border-b-[1.5px] border-[rgba(61,61,61,0.6)]">
      <div className="max-w-[1496px] mx-auto px-4 h-12 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/favicon.svg" alt="" className="h-5 w-5" />
          <span className="font-heading text-lg text-primary tracking-tight">
            MORI
          </span>
        </Link>

        {/* Desktop nav — browse destinations only */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {browseNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const linkClass = cn(
              "relative px-3 py-1 text-[11px] tracking-[0.22em] uppercase font-body font-medium transition-colors duration-200",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            );

            return (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-px bg-primary origin-left transition-transform duration-200",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right: actions + search + hamburger */}
        <div className="flex items-center gap-1.5">
          {/* Desktop action pills */}
          <div className="hidden md:flex items-center gap-1.5">
            {actionNavItems.map((item) => {
              const isSupport = item.label === "Support Us";
              const Icon = ACTION_ICONS[item.icon ?? "Heart"] ?? Heart;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase font-body font-medium rounded-full transition-colors duration-200",
                    isSupport
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </a>
              );
            })}
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={cn(
                  "w-40 lg:w-48 h-9 pl-10 pr-3 text-xs font-body rounded-full",
                  "bg-muted border-[1.5px] border-[rgba(61,61,61,0.6)] text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                  "focus:w-56 lg:focus:w-64 transition-all duration-300",
                )}
              />
            </div>
          </form>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden inline-flex items-center justify-center h-12 w-10 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center h-12 w-10 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-b border-border animate-fade-in">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, TV shows..."
                autoFocus
                className="w-full h-10 pl-10 pr-4 text-sm font-body bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile hamburger menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop — closes on tap */}
          <div
            className="fixed inset-0 top-12 bg-black/60 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          <nav
            className="relative md:hidden bg-background border-b-[1.5px] border-[rgba(61,61,61,0.6)] animate-slide-up shadow-2xl"
            aria-label="Mobile navigation"
          >
            <div className="px-3 py-3 space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto">
              {/* Support section */}
              <p className="px-3 pt-1 pb-1 text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                Support
              </p>
              {actionNavItems.map((item) => {
                const isSupport = item.label === "Support Us";
                const Icon = ACTION_ICONS[item.icon ?? "Heart"] ?? Heart;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 text-xs tracking-[0.18em] uppercase font-body font-medium rounded transition-colors",
                      isSupport
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </a>
                );
              })}

              {/* Our Sites section */}
              <p className="px-3 pt-4 pb-1 mt-2 border-t border-border text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                Our Sites
              </p>
              {sisterNavItems.map((item) => {
                const Icon = SISTER_ICONS[item.icon ?? "Globe"] ?? Globe;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-3 text-xs tracking-[0.18em] uppercase font-body font-medium rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </a>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
