"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { getPosterUrl } from "@/lib/tmdb-image";
import { LoaderCircle, Library, Film, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";

// ---- Static MCU chronological order (TMDB IDs) ----
const MCU_IDS = [
  1726,  // Iron Man
  10138, // Iron Man 2
  1724,  // Thor
  1771,  // Captain America: The First Avenger
  24428, // The Avengers
  68721, // Iron Man 3
  76338, // Thor: The Dark World
  100402,// Captain America: The Winter Soldier
  118340,// Guardians of the Galaxy
  99861, // Avengers: Age of Ultron
  102899,// Ant-Man
  271110,// Captain America: Civil War
  284052,// Doctor Strange
  283995,// Guardians of the Galaxy Vol. 2
  315635,// Spider-Man: Homecoming
  284053,// Thor: Ragnarok
  284054,// Black Panther
  299536,// Avengers: Infinity War
  363088,// Ant-Man and the Wasp
  299537,// Captain Marvel
  299534,// Avengers: Endgame
  429617,// Spider-Man: Far From Home
  634649,// Spider-Man: No Way Home
  453395,// Doctor Strange in the Multiverse of Madness
  616037,// Thor: Love and Thunder
  505642,// Black Panther: Wakanda Forever
  640146,// Ant-Man and the Wasp: Quantumania
  447365,// Guardians of the Galaxy Vol. 3
  609681,// The Marvels
  617127,// Deadpool & Wolverine
];

interface CollectionDef {
  slug: string;
  name: string;
  description: string;
  tmdbCollectionId?: number;
  staticIds?: number[];
}

const COLLECTIONS: CollectionDef[] = [
  {
    slug: "mcu",
    name: "Marvel Cinematic Universe",
    description: "Every MCU film in chronological order — from Iron Man to Deadpool & Wolverine",
    staticIds: MCU_IDS,
  },
  {
    slug: "harry-potter",
    name: "Harry Potter",
    description: "All 8 films in the Wizarding World saga",
    tmdbCollectionId: 1241,
  },
  {
    slug: "star-wars",
    name: "Star Wars",
    description: "The Skywalker Saga and spin-offs",
    tmdbCollectionId: 10,
  },
  {
    slug: "lotr",
    name: "Lord of the Rings",
    description: "Middle-earth in all its glory — LOTR & The Hobbit trilogies",
    tmdbCollectionId: 119,
  },
  {
    slug: "fast",
    name: "Fast & Furious",
    description: "Every high-octane chapter in the Fast saga",
    tmdbCollectionId: 9485,
  },
  {
    slug: "jurassic",
    name: "Jurassic Park",
    description: "The complete dinosaur saga — 6 films",
    tmdbCollectionId: 328,
  },
  {
    slug: "dark-knight",
    name: "The Dark Knight Trilogy",
    description: "Nolan's definitive Batman trilogy",
    tmdbCollectionId: 263,
  },
  {
    slug: "pirates",
    name: "Pirates of the Caribbean",
    description: "Captain Jack Sparrow's adventures — 5 films",
    tmdbCollectionId: 295,
  },
  {
    slug: "hunger-games",
    name: "The Hunger Games",
    description: "The complete saga including prequel",
    tmdbCollectionId: 131635,
  },
  {
    slug: "mission-impossible",
    name: "Mission: Impossible",
    description: "Ethan Hunt's impossible missions — 7 films",
    tmdbCollectionId: 87359,
  },
];

// ---- Fetch helpers ----
interface MovieBrief {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
}

async function fetchCollection(id: number): Promise<MovieBrief[]> {
  try {
    const res = await fetch(`${TMDB_BASE}/collection/${id}?api_key=${TMDB_KEY}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.parts || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      posterPath: p.poster_path || null,
      releaseDate: p.release_date || "",
    }));
  } catch {
    return [];
  }
}

async function fetchMovies(ids: number[]): Promise<MovieBrief[]> {
  try {
    const results = await Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}`);
        if (!res.ok) return null;
        const d = await res.json();
        return {
          id: d.id,
          title: d.title,
          posterPath: d.poster_path || null,
          releaseDate: d.release_date || "",
        };
      }),
    );
    return results.filter(Boolean) as MovieBrief[];
  } catch {
    return [];
  }
}

// ---- Component ----
export default function CollectionsPage() {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [movies, setMovies] = React.useState<Record<string, MovieBrief[]>>({});
  const [loading, setLoading] = React.useState<string | null>(null);

  const loadCollection = React.useCallback(
    async (c: CollectionDef) => {
      if (movies[c.slug]) return; // already loaded
      setLoading(c.slug);
      let data: MovieBrief[];
      if (c.staticIds) {
        data = await fetchMovies(c.staticIds);
      } else if (c.tmdbCollectionId) {
        data = await fetchCollection(c.tmdbCollectionId);
      } else {
        data = [];
      }
      setMovies((prev) => ({ ...prev, [c.slug]: data }));
      setLoading(null);
    },
    [movies],
  );

  const toggle = (c: CollectionDef) => {
    if (expanded === c.slug) {
      setExpanded(null);
    } else {
      setExpanded(c.slug);
      loadCollection(c);
    }
  };

  return (
    <div className="container-cine py-10">
      <div className="flex items-center gap-3 mb-8">
        <Library className="w-6 h-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
          Collections
        </h1>
        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-sm">
          {COLLECTIONS.length}
        </span>
      </div>

      <div className="space-y-3">
        {COLLECTIONS.map((c) => {
          const isOpen = expanded === c.slug;
          const isLoading = loading === c.slug;
          const items = movies[c.slug] || [];

          return (
            <div
              key={c.slug}
              className="rounded-lg border border-border bg-card/50 overflow-hidden transition-colors hover:border-primary/30"
            >
              <button
                onClick={() => toggle(c)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-heading font-bold text-foreground">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {c.description}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  {items.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-sm">
                      {items.length} films
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 pb-4 pt-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoaderCircle className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  ) : items.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {items.map((m, i) => (
                        <Link
                          key={m.id}
                          href={`/movies/${m.id}`}
                          className="flex-shrink-0 w-28 group"
                        >
                          <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-muted border border-border group-hover:border-primary/50 transition-colors">
                            {m.posterPath ? (
                              <Image
                                src={getPosterUrl(m.posterPath, "w185")}
                                alt={m.title}
                                fill
                                sizes="112px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                <Film className="w-6 h-6 opacity-30" />
                              </div>
                            )}
                            <span className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/70 text-[10px] font-mono font-bold text-white">
                              {i + 1}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-foreground line-clamp-2 mt-1.5 group-hover:text-primary transition-colors leading-tight">
                            {m.title}
                          </p>
                          {m.releaseDate && (
                            <p className="text-[9px] text-muted-foreground font-mono">
                              {m.releaseDate.slice(0, 4)}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-4">
                      Failed to load. Try again later.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
