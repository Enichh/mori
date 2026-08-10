"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";

const STORAGE_KEY = "mori:sister-sites-seen";

const SITES = [
  {
    name: "Kageru",
    url: "https://kageru.pages.dev",
    desc: "Manhwa &amp; Manga",
    icon: "K",
    color: "from-sky-500/10 via-blue-500/5 to-indigo-500/10 border-sky-500/20 hover:border-sky-500/40",
    textColor: "group-hover:text-sky-400",
  },
  {
    name: "Necros",
    url: "https://necros.pages.dev",
    desc: "Anime Streaming",
    icon: "N",
    color: "from-rose-500/10 via-red-500/5 to-pink-500/10 border-rose-500/20 hover:border-rose-500/40",
    textColor: "group-hover:text-rose-400",
  },
  {
    name: "Follen",
    url: "https://follen.pages.dev",
    desc: "Movies &amp; TV",
    icon: "F",
    color: "from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-violet-500/20 hover:border-violet-500/40",
    textColor: "group-hover:text-violet-400",
  },
  {
    name: "Silip",
    url: "https://silip.pages.dev",
    desc: "Filipino Movies",
    icon: "S",
    color: "from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-500/20 hover:border-amber-500/40",
    textColor: "group-hover:text-amber-400",
  },
];

export function SisterSitesModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <h2 className="text-lg font-heading font-bold text-foreground">
            Welcome to Mori
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            While you&apos;re here, check out our sister sites — each one built
            with the same love for free, quality content.
          </p>
        </div>

        {/* Sites */}
        <div className="px-6 pb-2 space-y-2">
          {SITES.map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r ${site.color} border transition-all duration-200`}
            >
              <span className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-muted border border-border text-[11px] font-heading font-bold text-muted-foreground group-hover:text-foreground group-hover:border-primary/50 transition-colors">
                {site.icon}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-heading font-bold text-foreground ${site.textColor} transition-colors`}
                >
                  {site.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {site.desc}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            You won&apos;t see this again
          </p>
          <button
            onClick={dismiss}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <X className="w-3 h-3" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
