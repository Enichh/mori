import type { Metadata } from "next";
import { AnimeShell } from "./anime-shell";

const ANILIST_API = "https://graphql.anilist.co";

export async function generateStaticParams() {
  try {
    const query = `
      query {
        Page(page: 1, perPage: 30) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
          }
        }
      }
    `;
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [{ id: "placeholder" }];
    const json = await res.json();
    const media: { id: number }[] = json.data?.Page?.media ?? [];
    if (!media.length) return [{ id: "placeholder" }];
    const ids = media.map((a) => ({ id: String(a.id) }));
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

  if (id === "placeholder") {
    return {
      title: "Anime — Mori",
      description:
        "Watch free anime online in HD on Mori. Stream the latest and greatest anime series.",
      openGraph: {
        title: "Anime — Mori",
        description: "Watch free anime online in HD on Mori.",
        siteName: "Mori",
        type: "website",
      },
    };
  }

  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { english romaji native }
          description(asHtml: false)
          coverImage { large }
          bannerImage
          genres
          seasonYear
          averageScore
        }
      }
    `;
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables: { id: parseInt(id, 10) } }),
    });
    if (!res.ok) throw new Error("not found");
    const json = await res.json();
    if (json.errors)
      throw new Error(json.errors[0]?.message ?? "GraphQL error");
    const anime = json.data?.Media;
    if (!anime) throw new Error("not found");

    const animeTitle =
      anime.title?.english ||
      anime.title?.romaji ||
      anime.title?.native ||
      "Anime";
    const title = `${animeTitle} — Mori`;
    const description =
      (anime.description || "").replace(/<[^>]*>/g, "").slice(0, 160) ||
      `Watch ${animeTitle} free online in HD on Mori.`;
    const posterUrl = anime.coverImage?.large || undefined;
    const bannerUrl = anime.bannerImage || undefined;
    const genreString = (anime.genres || []).join(", ");
    const yearLabel = anime.seasonYear ? ` (${anime.seasonYear})` : "";
    const scoreLabel = anime.averageScore
      ? ` • Score: ${anime.averageScore}%`
      : "";

    return {
      title,
      description,
      openGraph: {
        title: `${animeTitle}${yearLabel} — Mori`,
        description: genreString
          ? `${genreString}${scoreLabel} — ${description.slice(0, 120)}`
          : description,
        images: posterUrl ? [posterUrl] : [],
        type: "video.tv_show",
        siteName: "Mori",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: posterUrl ? [posterUrl] : [],
      },
      other: {
        ...(posterUrl
          ? { "og:image:width": "460", "og:image:height": "650" }
          : {}),
        ...(bannerUrl ? { "og:image:alt": bannerUrl } : {}),
      },
    } satisfies Metadata;
  } catch {
    return {
      title: "Anime — Mori",
      description: "Watch free anime online in HD on Mori.",
    };
  }
}

export default function Page() {
  return <AnimeShell />;
}
