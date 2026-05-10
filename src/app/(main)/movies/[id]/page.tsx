import type { Metadata } from "next";
import { MovieShell } from "./movie-shell";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY =
  process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function generateStaticParams() {
  if (!API_KEY) return [{ id: "placeholder" }];
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return [{ id: "placeholder" }];
    const data = await res.json();
    const ids = (data.results || []).slice(0, 50).map((m: { id: number }) => ({
      id: String(m.id),
    }));
    ids.push({ id: "placeholder" }); // Always keep fallback for non-pre-rendered pages
    return ids;
  } catch {
    return [{ id: "placeholder" }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (id === "placeholder" || !API_KEY) {
    return {
      title: "Movie — Mori",
      description:
        "Watch free movies online in HD on Mori. Stream the latest blockbusters and classics.",
      openGraph: {
        title: "Movies — Mori",
        description: "Watch free movies online in HD on Mori.",
        siteName: "Mori",
        type: "website",
      },
    };
  }

  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${id}?api_key=${API_KEY}&language=en-US`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) throw new Error("not found");
    const movie = await res.json();

    const title = `${movie.title || "Movie"} — Mori`;
    const description =
      (movie.overview || "").slice(0, 160) ||
      `Watch ${movie.title || "this movie"} free online in HD on Mori.`;
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : undefined;
    const backdropUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: posterUrl ? [posterUrl] : [],
        type: "video.movie",
        siteName: "Mori",
        ...(movie.release_date ? { releaseDate: movie.release_date } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: posterUrl ? [posterUrl] : [],
      },
      other: {
        ...(posterUrl
          ? { "og:image:width": "500", "og:image:height": "750" }
          : {}),
        ...(backdropUrl ? { "og:image:alt": backdropUrl } : {}),
      },
    } satisfies Metadata;
  } catch {
    return {
      title: "Movie — Mori",
      description: "Watch free movies online in HD on Mori.",
    };
  }
}

export default function Page() {
  return <MovieShell />;
}
