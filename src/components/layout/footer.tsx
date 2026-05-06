import Link from "next/link";
import { footerLinks } from "@/config/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-[1440px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-3">
              <span className="font-heading text-2xl text-primary tracking-tight">
                MORI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs">
              Your gateway to streaming movies, TV shows, and anime. Powered by
              community-driven sources for a seamless viewing experience.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-sm text-foreground mb-4 uppercase tracking-wider">
              Browse
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-body"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* TMDB Attribution */}
          <div>
            <h4 className="font-heading text-sm text-foreground mb-4 uppercase tracking-wider">
              Attribution
            </h4>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              This product uses the TMDB API but is not endorsed or certified by
              TMDB.
            </p>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3"
            >
              <img
                src="/tmdb-logo.svg"
                alt="TMDB"
                className="h-3 opacity-50 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-body">
            &copy; {currentYear} Mori. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-mono">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
