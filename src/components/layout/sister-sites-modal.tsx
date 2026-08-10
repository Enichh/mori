"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";

const STORAGE_KEY = "mori:sister-sites-seen";

const SITES = [
  {
    name: "Kageru",
    url: "https://kageru.pages.dev",
    desc: "Manhwa & Manga",
    icon: "K",
    ring: "ring-sky-500/20",
    bg: "bg-sky-500/10 border-sky-500/20 hover:border-sky-500/50",
    text: "group-hover:text-sky-400",
  },
  {
    name: "Necros",
    url: "https://necros.pages.dev",
    desc: "Anime Streaming",
    icon: "N",
    ring: "ring-rose-500/20",
    bg: "bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50",
    text: "group-hover:text-rose-400",
  },
  {
    name: "Follen",
    url: "https://follen.pages.dev",
    desc: "Movies & TV",
    icon: "F",
    ring: "ring-violet-500/20",
    bg: "bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50",
    text: "group-hover:text-violet-400",
  },
  {
    name: "Silip",
    url: "https://silip.pages.dev",
    desc: "Filipino Movies",
    icon: "S",
    ring: "ring-amber-500/20",
    bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50",
    text: "group-hover:text-amber-400",
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

  const dismiss = () => setVisible(false);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      <div className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto bg-card border border-border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-heading font-bold text-foreground">
            Welcome to Mori
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Check out our sister sites — built with the same love for free
            content.
          </p>
        </div>

        {/* Sites */}
        <div className="px-5 pb-1 space-y-1.5">
          {SITES.map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className={`group flex items-center gap-2.5 px-3 py-2 rounded-md border ${site.bg} transition-colors`}
            >
              <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-muted border border-border text-[10px] font-heading font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                {site.icon}
              </span>
              <span
                className={`text-xs font-medium text-foreground ${site.text} transition-colors`}
              >
                {site.name}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {site.desc}
              </span>
              <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 pt-2.5 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            One per session
          </p>
          <button
            onClick={dismiss}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <X className="w-3 h-3" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
