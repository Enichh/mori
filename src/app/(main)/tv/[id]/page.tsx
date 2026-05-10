import type { Metadata } from "next";
import { TVShell } from "./tv-shell";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY =
  process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function generateStaticParams() {
  if (!API_KEY) return [{ id: "placeholder" }];
  try {
    const res = await fetch(
      `${TMDB_BASE}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return [{ id: "placeholder" }];
    const data = await res.json();
    return (data.results || []).slice(0, 50).map((t: { id: number }) => ({
      id: String(t.id),
    }));
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
      title: "TV Show — Mori",
      description:
        "Watch free TV shows online in HD on Mori. Stream popular series and discover new favorites.",
      openGraph: {
        title: "TV Shows — Mori",
        description: "Watch free TV shows online in HD on Mori.",
        siteName: "Mori",
        type: "website",
      },
    };
  }

  try {
    const res = await fetch(
      `${TMDB_BASE}/tv/${id}?api_key=${API_KEY}&language=en-US`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) throw new Error("not found");
    const show = await res.json();

    const title = `${show.name || "TV Show"} — Mori`;
    const description =
      (show.overview || "").slice(0, 160) ||
      `Watch ${show.name || "this TV show"} free online in HD on Mori.`;
    const posterUrl = show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: posterUrl ? [posterUrl] : [],
        type: "video.tv_show",
        siteName: "Mori",
        ...(show.first_air_date ? { releaseDate: show.first_air_date } : {}),
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
      },
    } satisfies Metadata;
  } catch {
    return {
      title: "TV Show — Mori",
      description: "Watch free TV shows online in HD on Mori.",
    };
  }
}

export default function Page() {
  return <TVShell />;
}
