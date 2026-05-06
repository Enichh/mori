import Link from "next/link";
import { footerLinks } from "@/config/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background md:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-2">
              <span className="font-heading text-xl md:text-2xl text-primary tracking-tight">
                MORI
              </span>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground font-body leading-relaxed max-w-xs">
              Your gateway to streaming movies, TV shows, and anime.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-xs md:text-sm text-foreground mb-3 uppercase tracking-wider">
              Browse
            </h4>
            <ul className="space-y-1.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Attribution */}
          <div>
            <h4 className="font-heading text-xs md:text-sm text-foreground mb-3 uppercase tracking-wider">
              Attribution
            </h4>
            <p className="text-[11px] md:text-xs text-muted-foreground font-body leading-relaxed">
              This product uses the TMDB API but is not endorsed or certified by
              TMDB.
            </p>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2"
            >
              <img
                src="/tmdb-logo.svg"
                alt="TMDB"
                className="h-3 opacity-50 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border flex items-center justify-between gap-4">
          <p className="text-[10px] md:text-xs text-muted-foreground font-body">
            &copy; {currentYear} Mori. All rights reserved.
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground font-mono">
            v1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}
