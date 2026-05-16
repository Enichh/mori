"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNavItems } from "@/config/navigation";

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
    <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b-[1.5px] border-[rgba(61,61,61,0.6)]">
      <div className="max-w-[1496px] mx-auto px-4 h-12 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-heading text-lg text-primary tracking-tight">
            MORI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {mainNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const linkClass = cn(
              "px-3 py-1 text-[11px] tracking-[0.22em] uppercase font-body font-medium transition-colors duration-200",
              "hover:text-primary",
              isActive
                ? "text-primary border-l-2 border-primary pl-2"
                : "text-muted-foreground",
            );

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-1">
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={cn(
                  "w-44 lg:w-56 h-9 pl-10 pr-3 text-xs font-body",
                  "bg-muted border-[1.5px] border-[rgba(61,61,61,0.6)] text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                  "transition-all duration-200",
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden border-b-[1.5px] border-[rgba(61,61,61,0.6)] bg-background animate-fade-in"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-2 space-y-0.5">
            {mainNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const linkClass = cn(
                "block px-4 py-3 text-xs tracking-[0.18em] uppercase font-body font-medium transition-colors rounded",
                isActive
                  ? "text-primary bg-primary/5 border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              );

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
